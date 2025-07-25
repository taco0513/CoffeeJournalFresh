import { supabase } from './client';
import RealmService from '../realm/RealmService';
import { ITastingRecord, IFlavorNote, ISensoryAttribute } from '../realm/schemas';
import { useTastingStore } from '../../stores/tastingStore';
import NetInfo from '@react-native-community/netinfo';
import { ENABLE_SYNC } from '../../../App';
import NetworkUtils from '../../utils/NetworkUtils';
// import { reportError } from '../../utils/sentry';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  error: string | null;
}

export interface SupabaseTastingRecord {
  id: string;
  user_id: string;
  realm_id: string;
  created_at: string;
  updated_at: string;
  cafe_name?: string;
  roastery: string;
  coffee_name: string;
  origin?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  temperature: 'hot' | 'ice';
  roaster_notes?: string;
  personal_comment?: string;
  match_score: number;  // 단일 필드로 통합
}

export interface SupabaseFlavorNote {
  id: string;
  tasting_id: string;
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  created_at: string;
}

export interface SupabaseSensoryAttribute {
  id: string;
  tasting_id: string;
  body: number;
  acidity: number;
  sweetness: number;
  finish: number;
  mouthfeel: string;
  created_at: string;
}

class SyncService {
  private static instance: SyncService;
  private syncStatus: SyncStatus = {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    error: null,
  };

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      this.syncStatus.isOnline = state.isConnected || false;
      
      // 온라인 상태가 되면 자동 동기화 시도
      if (ENABLE_SYNC && this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.syncAll();
      }
    });
  }

  // 네트워크 상태 확인
  async checkNetworkStatus(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.syncStatus.isOnline = state.isConnected || false;
      return this.syncStatus.isOnline;
    } catch (error) {
      this.syncStatus.isOnline = false;
      return false;
    }
  }

  // 현재 동기화 상태 반환
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // 전체 동기화 실행
  async syncAll(): Promise<void> {
    if (!ENABLE_SYNC) {
      return;
    }
    
    if (this.syncStatus.isSyncing) {
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.updateTastingStore();

    try {
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      // 1. 로컬 → Supabase 업로드
      await this.uploadLocalChanges();

      // 2. Supabase → 로컬 다운로드
      await this.downloadRemoteChanges();

      // 3. Achievement 데이터 동기화
      await this.syncAchievements();

      // 4. 동기화 완료 처리
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.error = null;
      
    } catch (error) {
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown sync error';
    } finally {
      this.syncStatus.isSyncing = false;
      this.updateTastingStore();
    }
  }

  // 로컬 변경사항을 Supabase로 업로드
  async uploadLocalChanges(): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const unsyncedRecords = realmService.getUnsyncedRecords();
      
      this.syncStatus.pendingUploads = unsyncedRecords.length;
      this.updateTastingStore();

      for (const record of unsyncedRecords) {
        try {
          await this.uploadSingleRecord(record);
        } catch (error) {
          // 개별 업로드 실패는 전체 동기화를 중단하지 않음
        }
      }

      this.syncStatus.pendingUploads = 0;
      this.updateTastingStore();
    } catch (error) {
      throw error;
    }
  }

  // 개별 레코드 업로드
  private async uploadSingleRecord(record: ITastingRecord): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // 1. 메인 테이스팅 레코드 업로드
      const tastingData: Partial<SupabaseTastingRecord> = {
        user_id: user.id,
        realm_id: record.id,
        cafe_name: record.cafeName || undefined,
        roastery: record.roastery,
        coffee_name: record.coffeeName,
        origin: record.origin || undefined,
        variety: record.variety || undefined,
        altitude: record.altitude || undefined,
        process: record.process || undefined,
        temperature: record.temperature === 'cold' ? 'ice' : record.temperature as 'hot' | 'ice',
        roaster_notes: record.roasterNotes || undefined,
        personal_comment: record.personalComment || undefined,
        match_score: record.matchScoreTotal || 0,  // Total 점수만 사용
        created_at: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString(),
        updated_at: record.updatedAt ? record.updatedAt.toISOString() : new Date().toISOString(),
      };

      const { data: tastingRecord, error: tastingError } = await NetworkUtils.retry(
        async () => {
          const result = await supabase
            .from('tasting_records')
            .upsert(tastingData, { onConflict: 'realm_id' })
            .select()
            .single();
          
          if (result.error) {
            throw result.error;
          }
          
          return result;
        },
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`[Sync] Retrying tasting record upload (attempt ${attempt}):`, error.message);
          }
        }
      );

      if (tastingError) {
        throw tastingError;
      }

      // 2. 맛 노트 업로드
      if (record.flavorNotes && record.flavorNotes.length > 0) {
        // 기존 맛 노트 삭제
        await supabase
          .from('flavor_notes')
          .delete()
          .eq('tasting_id', tastingRecord.id);

        // 새로운 맛 노트 삽입
        const flavorNotes: any[] = [];
        // Realm은 정규화된 구조, Supabase는 비정규화 구조 사용
        // 각 flavor path를 하나의 레코드로 변환
        const flavorsByPath: any = {};
        
        record.flavorNotes.forEach((note: IFlavorNote) => {
          const key = `${note.level || ''}`;
          if (!flavorsByPath[key]) {
            flavorsByPath[key] = {
              tasting_id: tastingRecord.id,
              level1: null,
              level2: null,
              level3: null,
              level4: null,
            };
          }
          
          // level에 따라 적절한 필드에 값 설정
          if (note.level === 1 && note.value) {
            flavorsByPath[key].level1 = note.value;
          } else if (note.level === 2 && note.value) {
            flavorsByPath[key].level2 = note.value;
          } else if (note.level === 3 && note.value) {
            flavorsByPath[key].level3 = note.value;
          } else if (note.level === 4 && note.value) {
            flavorsByPath[key].level4 = note.value;
          }
        });
        
        // 변환된 데이터를 배열로 변환
        Object.values(flavorsByPath).forEach(flavor => {
          flavorNotes.push(flavor);
        });

        const { error: flavorError } = await supabase
          .from('flavor_notes')
          .insert(flavorNotes);

        if (flavorError) {
          throw flavorError;
        }
      }

      // 3. 감각 속성 업로드
      if (record.sensoryAttribute) {
        const sensoryData = {
          tasting_id: tastingRecord.id,
          body: record.sensoryAttribute.body,
          acidity: record.sensoryAttribute.acidity,
          sweetness: record.sensoryAttribute.sweetness,
          finish: record.sensoryAttribute.finish,
          mouthfeel: record.sensoryAttribute.mouthfeel,
        };

        const { error: sensoryError } = await supabase
          .from('sensory_attributes')
          .upsert(sensoryData, { onConflict: 'tasting_id' });

        if (sensoryError) {
          throw sensoryError;
        }
      }

      // 4. 로컬 레코드를 동기화됨으로 표시
      const realmService = RealmService.getInstance();
      realmService.markAsSynced([record.id]);

    } catch (error) {
      throw error;
    }
  }

  // Supabase에서 변경사항 다운로드
  async downloadRemoteChanges(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const realmService = RealmService.getInstance();
      const lastSyncTime = this.syncStatus.lastSyncTime;

      // 마지막 동기화 이후 변경된 레코드 가져오기
      let query = supabase
        .from('tasting_records')
        .select(`
          *,
          flavor_notes (*),
          sensory_attributes (*)
        `)
        .eq('user_id', user.id);

      if (lastSyncTime) {
        query = query.gte('updated_at', lastSyncTime.toISOString());
      }

      const { data: remoteRecords, error } = await NetworkUtils.retry(
        async () => {
          const result = await query;
          if (result.error) {
            throw result.error;
          }
          return result;
        },
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            console.log(`[Sync] Retrying download records (attempt ${attempt}):`, error.message);
          }
        }
      );

      if (error) {
        throw error;
      }

      // 각 레코드를 로컬에 저장
      if (remoteRecords && remoteRecords.length > 0) {
        for (const remoteRecord of remoteRecords) {
          await this.downloadSingleRecord(remoteRecord);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // 개별 레코드 다운로드 및 충돌 해결
  private async downloadSingleRecord(remoteRecord: any): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const localRecord = await realmService.getTastingRecordById(remoteRecord.realm_id);

      if (!localRecord) {
        // 새로운 레코드 생성
        await this.createLocalRecord(remoteRecord);
      } else {
        // 충돌 해결
        await this.resolveConflict(localRecord, remoteRecord);
      }
    } catch (error) {
      throw error;
    }
  }

  // 로컬에 새 레코드 생성
  private async createLocalRecord(remoteRecord: any): Promise<void> {
    try {
      const realmService = RealmService.getInstance();

      // 맛 노트 변환 (Supabase의 비정규화 구조를 Realm의 정규화 구조로)
      const flavorNotes: IFlavorNote[] = [];
      
      remoteRecord.flavor_notes?.forEach((note: any) => {
        // level1-4 각각을 개별 FlavorNote로 변환
        if (note.level1) {
          flavorNotes.push({ level: 1, value: note.level1 });
        }
        if (note.level2) {
          flavorNotes.push({ level: 2, value: note.level2 });
        }
        if (note.level3) {
          flavorNotes.push({ level: 3, value: note.level3 });
        }
        if (note.level4) {
          flavorNotes.push({ level: 4, value: note.level4 });
        }
      });

      // 감각 속성 변환
      let sensoryAttribute: ISensoryAttribute | undefined;
      if (remoteRecord.sensory_attributes && remoteRecord.sensory_attributes.length > 0) {
        const sensory = remoteRecord.sensory_attributes[0];
        sensoryAttribute = {
          body: sensory.body,
          acidity: sensory.acidity,
          sweetness: sensory.sweetness,
          finish: sensory.finish,
          mouthfeel: sensory.mouthfeel,
        };
      }

      // 로컬 레코드 생성
      const localData: Omit<ITastingRecord, 'id'> = {
        createdAt: new Date(remoteRecord.created_at),
        updatedAt: new Date(remoteRecord.updated_at),
        cafeName: remoteRecord.cafe_name || '',
        roastery: remoteRecord.roastery,
        coffeeName: remoteRecord.coffee_name,
        origin: remoteRecord.origin || '',
        variety: remoteRecord.variety || '',
        altitude: remoteRecord.altitude || '',
        process: remoteRecord.process || '',
        temperature: remoteRecord.temperature,
        roasterNotes: remoteRecord.roaster_notes || '',
        personalComment: remoteRecord.personal_comment || '',
        matchScoreTotal: remoteRecord.match_score || 0,
        matchScoreFlavor: 0,  // TODO: 나중에 제거
        matchScoreSensory: 0,  // TODO: 나중에 제거
        flavorNotes,
        sensoryAttribute: sensoryAttribute as ISensoryAttribute,
        isSynced: true,
        isDeleted: false,  // Realm에는 있지만 Supabase에는 없음
        syncedAt: new Date(),
      };

      const realm = realmService.getRealm();
      realm.write(() => {
        realm.create<ITastingRecord>('TastingRecord', {
          id: remoteRecord.realm_id,
          ...localData,
        });
      });

    } catch (error) {
      throw error;
    }
  }

  // 충돌 해결 (최신 업데이트 시간 기준)
  private async resolveConflict(localRecord: ITastingRecord, remoteRecord: any): Promise<void> {
    try {
      const localUpdatedAt = localRecord.updatedAt;
      const remoteUpdatedAt = new Date(remoteRecord.updated_at);

      // 원격 레코드가 더 최신인 경우
      if (remoteUpdatedAt > localUpdatedAt) {
        await this.updateLocalRecord(localRecord, remoteRecord);
      } else if (localUpdatedAt > remoteUpdatedAt) {
        await this.uploadSingleRecord(localRecord);
      } else {
        await this.updateLocalRecord(localRecord, remoteRecord);
      }
    } catch (error) {
      throw error;
    }
  }

  // 로컬 레코드 업데이트
  private async updateLocalRecord(localRecord: ITastingRecord, remoteRecord: any): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();

      realm.write(() => {
        // 기본 필드 업데이트
        localRecord.updatedAt = new Date(remoteRecord.updated_at);
        localRecord.cafeName = remoteRecord.cafe_name || '';
        localRecord.roastery = remoteRecord.roastery;
        localRecord.coffeeName = remoteRecord.coffee_name;
        localRecord.origin = remoteRecord.origin || '';
        localRecord.variety = remoteRecord.variety || '';
        localRecord.altitude = remoteRecord.altitude || '';
        localRecord.process = remoteRecord.process || '';
        localRecord.temperature = remoteRecord.temperature;
        localRecord.roasterNotes = remoteRecord.roaster_notes || '';
        localRecord.personalComment = remoteRecord.personal_comment || '';
        localRecord.matchScoreTotal = remoteRecord.match_score || 0;
        // Flavor와 Sensory 점수는 현재 Supabase에 없으므로 0으로 설정
        localRecord.matchScoreFlavor = 0;
        localRecord.matchScoreSensory = 0;
        localRecord.isSynced = true;
        localRecord.syncedAt = new Date();

        // 맛 노트 업데이트
        if (remoteRecord.flavor_notes) {
          const newFlavorNotes: IFlavorNote[] = [];
          
          remoteRecord.flavor_notes.forEach((note: any) => {
            if (note.level1) {
              newFlavorNotes.push({ level: 1, value: note.level1 });
            }
            if (note.level2) {
              newFlavorNotes.push({ level: 2, value: note.level2 });
            }
            if (note.level3) {
              newFlavorNotes.push({ level: 3, value: note.level3 });
            }
            if (note.level4) {
              newFlavorNotes.push({ level: 4, value: note.level4 });
            }
          });
          
          localRecord.flavorNotes = newFlavorNotes;
        }

        // 감각 속성 업데이트
        if (remoteRecord.sensory_attributes && remoteRecord.sensory_attributes.length > 0) {
          const sensory = remoteRecord.sensory_attributes[0];
          localRecord.sensoryAttribute = {
            body: sensory.body,
            acidity: sensory.acidity,
            sweetness: sensory.sweetness,
            finish: sensory.finish,
            mouthfeel: sensory.mouthfeel,
          };
        }
      });

    } catch (error) {
      throw error;
    }
  }

  // 수동 동기화 트리거
  async manualSync(): Promise<void> {
    if (!ENABLE_SYNC) {
      return;
    }
    await this.syncAll();
  }

  // 특정 레코드 강제 업로드
  async forceUploadRecord(recordId: string): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const record = await realmService.getTastingRecordById(recordId);
      
      if (!record) {
        throw new Error(`Record not found: ${recordId}`);
      }

      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      await this.uploadSingleRecord(record);
    } catch (error) {
      throw error;
    }
  }

  // 카페 및 로스터 정보 동기화
  async syncCafeAndRoasterInfo(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();

      // 카페 정보 동기화
      const cafes = realm.objects('CafeInfo').filtered('visitCount > 0');
      for (const cafe of cafes) {
        await supabase.rpc('increment_cafe_visit', {
          user_uuid: user.id,
          cafe_name_param: (cafe as any).name,
        });
      }

      // 로스터 정보 동기화
      const roasters = realm.objects('RoasterInfo').filtered('coffeeCount > 0');
      for (const roaster of roasters) {
        await supabase.rpc('increment_roaster_visit', {
          user_uuid: user.id,
          roaster_name_param: (roaster as any).name,
        });
      }

    } catch (error) {
    }
  }

  // TastingStore 업데이트
  private updateTastingStore(): void {
    // Zustand store는 직접 업데이트할 수 없으므로, 
    // 스토어에서 이 상태를 구독하도록 해야 함
    // 여기서는 단순히 콘솔 로그만 출력
  }

  /**
   * Sync user achievements to Supabase
   */
  async syncAchievements(): Promise<void> {
    try {
      if (!this.syncStatus.isOnline) {
        return;
      }

      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();
      
      // Get unsynced achievements
      const unsyncedAchievements = realm.objects('UserAchievement')
        .filtered('isSynced == false');

      if (unsyncedAchievements.length === 0) {
        return;
      }

      for (const achievement of unsyncedAchievements) {
        try {
          const { error } = await supabase
            .from('user_achievements')
            .upsert({
              id: achievement.id,
              user_id: achievement.userId,
              achievement_type: achievement.achievementType,
              achievement_level: achievement.achievementLevel,
              achievement_data: achievement.achievementData,
              progress: achievement.progress,
              unlocked_at: (achievement.createdAt as Date)?.toISOString() || new Date().toISOString(),
              created_at: (achievement.createdAt as Date)?.toISOString() || new Date().toISOString(),
              updated_at: (achievement.updatedAt as Date)?.toISOString() || new Date().toISOString(),
            }, {
              onConflict: 'id'
            });

          if (error) {
            throw error;
          }

          // Mark as synced
          realm.write(() => {
            achievement.isSynced = true;
            achievement.syncedAt = new Date();
          });

        } catch (error) {
          console.error('Failed to sync achievement:', achievement.id, error);
        }
      }

      // Also sync flavor learning progress and taste profiles
      await this.syncFlavorLearningProgress();
      await this.syncTasteProfiles();

    } catch (error) {
      console.error('Achievement sync failed:', error);
      this.syncStatus.error = 'Achievement sync failed';
    }
  }

  /**
   * Sync flavor learning progress
   */
  private async syncFlavorLearningProgress(): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();
      
      const unsyncedProgress = realm.objects('FlavorLearningProgress')
        .filtered('isSynced == false');

      for (const progress of unsyncedProgress) {
        try {
          const { error } = await supabase
            .from('flavor_learning_progress')
            .upsert({
              id: progress.id,
              user_id: progress.userId,
              flavor_category: progress.flavorCategory,
              specific_flavor: progress.specificFlavor,
              correct_identifications: progress.correctIdentifications,
              total_attempts: progress.totalAttempts,
              confidence_level: progress.confidenceLevel,
              learning_stage: progress.learningStage,
              created_at: (progress.createdAt as Date)?.toISOString() || new Date().toISOString(),
              updated_at: (progress.updatedAt as Date)?.toISOString() || new Date().toISOString(),
            }, {
              onConflict: 'id'
            });

          if (error) {
            throw error;
          }

          realm.write(() => {
            progress.isSynced = true;
          });

        } catch (error) {
          console.error('Failed to sync flavor progress:', progress.id, error);
        }
      }
    } catch (error) {
      console.error('Flavor learning progress sync failed:', error);
    }
  }

  /**
   * Sync user taste profiles
   */
  private async syncTasteProfiles(): Promise<void> {
    try {
      const realmService = RealmService.getInstance();
      const realm = realmService.getRealm();
      
      const unsyncedProfiles = realm.objects('UserTasteProfile')
        .filtered('isSynced == false');

      for (const profile of unsyncedProfiles) {
        try {
          const { error } = await supabase
            .from('user_taste_profiles')
            .upsert({
              id: profile.id,
              user_id: profile.userId,
              flavor_preferences: profile.flavorPreferences,
              sweetness_preference: profile.sweetnessPreference,
              acidity_preference: profile.acidityPreference,
              bitterness_preference: profile.bitternessPreference,
              body_preference: profile.bodyPreference,
              balance_preference: profile.balancePreference,
              total_tastings: profile.totalTastings,
              unique_flavors_tried: profile.uniqueFlavorsTried,
              vocabulary_level: profile.vocabularyLevel,
              taste_discovery_rate: profile.tasteDiscoveryRate,
              last_analysis_at: (profile.lastAnalysisAt as Date)?.toISOString() || null,
              created_at: (profile.createdAt as Date)?.toISOString() || new Date().toISOString(),
              updated_at: (profile.updatedAt as Date)?.toISOString() || new Date().toISOString(),
            }, {
              onConflict: 'id'
            });

          if (error) {
            throw error;
          }

          realm.write(() => {
            profile.isSynced = true;
          });

        } catch (error) {
          console.error('Failed to sync taste profile:', profile.id, error);
        }
      }
    } catch (error) {
      console.error('Taste profile sync failed:', error);
    }
  }

  // 정리
  cleanup(): void {
    // 필요한 경우 리소스 정리
  }
}

// 전역 동기화 상태 관리를 위한 스토어 확장
export const syncStore = {
  status: {
    isOnline: false,
    isSyncing: false,
    lastSyncTime: null,
    pendingUploads: 0,
    error: null,
  } as SyncStatus,
  
  updateStatus: (newStatus: Partial<SyncStatus>) => {
    syncStore.status = { ...syncStore.status, ...newStatus };
  },
  
  getStatus: () => ({ ...syncStore.status }),
};

// 편의 함수들
export const syncService = SyncService.getInstance();

export const syncUtils = {
  // 자동 동기화 시작
  startAutoSync: () => {
    if (!ENABLE_SYNC) {
      return;
    }
    setInterval(async () => {
      const status = syncService.getSyncStatus();
      if (ENABLE_SYNC && status.isOnline && !status.isSyncing) {
        await syncService.syncAll();
      }
    }, 5 * 60 * 1000); // 5분마다
  },

  // 네트워크 상태 확인
  checkConnection: async () => {
    return await syncService.checkNetworkStatus();
  },

  // 즉시 동기화
  syncNow: async () => {
    await syncService.manualSync();
  },

  // 동기화 상태 가져오기
  getSyncStatus: () => {
    return syncService.getSyncStatus();
  },
};

export default SyncService;