# 🍃 Cafe Mode - Step 5: Personal Comment 상세 명세서

## 개요

Personal Comment는 Cafe Mode TastingFlow의 **다섯 번째 단계**로, 사용자가 자유롭게 개인적인 소감과 메모를 기록하는 **완전 선택적 단계**입니다. 정형화된 평가를 넘어서 개인만의 언어로 커피 경험을 표현할 수 있는 공간을 제공합니다.

> **MVP 우선순위**: P2 (Nice to have) - 사용자 경험을 풍부하게 하는 기능

---

## 🎯 설계 목표

### 핵심 원칙
- **자유성**: 어떤 형식의 제약도 없는 자유로운 표현
- **개인성**: 오직 자신만을 위한 사적인 기록 공간
- **다양성**: 텍스트, 음성, 이미지 등 다양한 입력 방식
- **영감성**: 창의적이고 감성적인 표현 장려

### 사용자 목표
- ✅ 개인만의 언어로 커피 경험 기록
- ✅ 감정과 기억을 함께 저장
- ✅ 창의적이고 자유로운 표현
- ✅ 미래의 나에게 남기는 메시지

---

## 📋 데이터 구조

### 기본 인터페이스
```typescript
interface PersonalComment {
  // 주요 컨텐츠
  textContent?: string;                 // 텍스트 메모
  voiceNote?: VoiceNote;               // 음성 메모
  photos?: CommentPhoto[];             // 첨부 사진들
  
  // 감정 및 상황 컨텍스트
  mood: MoodState;                     // 기분 상태
  situation: SituationContext;         // 상황 맥락
  
  // 창의적 표현
  creativeTags: string[];              // 창의적 태그
  colorAssociation?: string;           // 연상되는 색깔
  soundAssociation?: string;           // 연상되는 소리
  
  // 개인적 연결
  memories: Memory[];                  // 떠오른 기억들
  comparisons: PersonalComparison[];   // 개인적 비교
  futureNotes: string[];              // 미래의 나에게
  
  // 메타데이터
  writingTime: number;                // 작성 소요 시간
  revisitCount: number;               // 다시 읽은 횟수
  isFavorite: boolean;                // 즐겨찾기 여부
  privacy: 'private' | 'shareable';   // 공개 설정
}

// 음성 메모 구조
interface VoiceNote {
  audioUrl: string;                   // 오디오 파일 URL
  duration: number;                   // 재생 시간 (초)
  transcription?: string;             // 자동 전사 텍스트
  timestamp: Date;                    // 녹음 시점
  quality: 'high' | 'medium' | 'low'; // 음질
}

// 첨부 사진 구조
interface CommentPhoto {
  imageUrl: string;                   // 이미지 URL
  caption?: string;                   // 사진 설명
  type: 'coffee' | 'moment' | 'place' | 'other'; // 사진 종류
  timestamp: Date;                    // 촬영 시점
}

// 기분 상태
interface MoodState {
  energy: number;                     // 에너지 레벨 (1-5)
  happiness: number;                  // 행복도 (1-5)
  calmness: number;                   // 평온함 (1-5)
  inspiration: number;                // 영감 레벨 (1-5)
  emoji?: string;                     // 대표 이모지
  keywords: string[];                 // 기분 키워드
}

// 상황 맥락
interface SituationContext {
  time: 'morning' | 'afternoon' | 'evening' | 'night';
  location: string;                   // 장소 설명
  weather?: string;                   // 날씨
  company: 'alone' | 'friends' | 'family' | 'colleagues'; // 함께한 사람
  activity: string;                   // 하던 일
  special: boolean;                   // 특별한 순간인지
}

// 개인적 기억
interface Memory {
  title: string;                      // 기억 제목
  description: string;                // 기억 설명
  emotion: 'happy' | 'nostalgic' | 'peaceful' | 'exciting'; // 감정
  strength: number;                   // 기억의 선명도 (1-5)
}

// 개인적 비교
interface PersonalComparison {
  type: 'taste' | 'smell' | 'feeling' | 'experience';
  comparison: string;                 // "엄마가 끓여주던 차 같아"
  similarity: number;                 // 유사도 (1-5)
}
```

---

## 🎨 사용자 인터페이스

### 기본 화면 구성
```
┌─────────────────────────────┐
│ ← [뒤로]  개인 소감  [건너뛰기] │
├─────────────────────────────┤
│                           │
│  💭 오늘의 커피는 어떠셨나요?     │
│                           │
│  🎨 자유롭게 표현해보세요        │
│                           │
│  ┌─────────────────────────┐ │
│  │ 📝 💬 📷 🎵           │ │
│  │ 글쓰기 음성 사진 분위기     │ │
│  └─────────────────────────┘ │
│                           │
│  ┌─────────────────────────┐ │
│  │                       │ │
│  │  아침 햇살처럼 밝고 따뜻한   │ │
│  │  느낌이었어요. 특별한      │ │
│  │  하루를 시작하는 기분...    │ │
│  │                       │ │
│  └─────────────────────────┘ │
│                           │
│  💡 영감 도구               │
│  [🌈 색깔] [🎵 소리] [📍 장소] │
│                           │
│  😊 지금 기분: 평온함          │
│                           │
│  [나중에 작성]    [다음 단계 →] │
└─────────────────────────────┘
```

### 확장 입력 도구
```
🎨 창작 도구 모음
├─ 📝 텍스트 에디터
│  ├─ 자유 작성 모드
│  ├─ 템플릿 모드 ("이 커피는...")
│  └─ 시/산문 모드
├─ 💬 음성 녹음
│  ├─ 자유 녹음 (최대 3분)
│  ├─ 실시간 전사
│  └─ 감정 분석
├─ 📷 순간 포착
│  ├─ 커피 사진
│  ├─ 분위기 사진
│  └─ 장소 사진
└─ 🎵 분위기 설정
   ├─ BGM 추천
   ├─ 환경음 녹음
   └─ 음성 메모 배경음
```

---

## 🧠 지능형 입력 도구

### 1. 창작 도움 AI
```typescript
class CreativeWritingAssistant {
  async generateInspirations(
    context: {
      coffeeInfo: CoffeeInfo;
      flavors: string[];
      mood: MoodState;
      situation: SituationContext;
    }
  ): Promise<CreativeInspiration[]> {
    
    const inspirations: CreativeInspiration[] = [];
    
    // 감각적 은유 생성
    const sensoryMetaphors = await this.generateSensoryMetaphors(context.flavors);
    inspirations.push({
      type: 'metaphor',
      title: '이 맛을 다른 것으로 표현하면?',
      suggestions: sensoryMetaphors
    });
    
    // 상황 기반 스토리 프롬프트
    const storyPrompts = this.generateStoryPrompts(context.situation);
    inspirations.push({
      type: 'story',
      title: '오늘의 이야기',
      suggestions: storyPrompts
    });
    
    // 감정 연결 도구
    const emotionalConnections = await this.suggestEmotionalConnections(context.mood);
    inspirations.push({
      type: 'emotion',
      title: '이 순간의 감정',
      suggestions: emotionalConnections
    });
    
    return inspirations;
  }
  
  private async generateSensoryMetaphors(flavors: string[]): Promise<string[]> {
    const metaphorTemplates = [
      "이 맛은 마치 {시간}의 {장소} 같아요",
      "{계절}에 {행동}하는 느낌이에요",
      "{색깔}빛 {소리}처럼 들려요",
      "{질감}한 {감정}을 안겨줘요"
    ];
    
    const elements = {
      시간: ["아침", "황혼", "새벽", "한밤중"],
      장소: ["숲속", "바다", "도서관", "할머니 집"],
      계절: ["봄날", "여름 오후", "가을 저녁", "겨울 아침"],
      행동: ["산책하는", "독서하는", "음악 듣는", "그림 그리는"],
      색깔: ["황금빛", "호박색", "연갈색", "진한 갈색"],
      소리: ["멜로디", "속삭임", "노래", "시"],
      질감: ["부드러운", "따뜻한", "포근한", "깊은"],
      감정: ["위로", "평온", "활력", "희망"]
    };
    
    return metaphorTemplates.map(template => {
      let result = template;
      Object.entries(elements).forEach(([key, values]) => {
        const randomValue = values[Math.floor(Math.random() * values.length)];
        result = result.replace(`{${key}}`, randomValue);
      });
      return result;
    });
  }
  
  private generateStoryPrompts(situation: SituationContext): string[] {
    const prompts = [
      `${situation.time}에 ${situation.location}에서 마신 이 커피는...`,
      `${situation.weather} 날씨에 어울리는 이 맛은...`,
      `${situation.company === 'alone' ? '혼자만의 시간' : '함께한 시간'}을 더욱 특별하게 만든 것은...`,
      `이 커피를 마시며 ${situation.activity}을/를 했던 순간...`
    ];
    
    return prompts.filter(prompt => !prompt.includes('undefined'));
  }
  
  async enhanceWriting(draft: string): Promise<WritingEnhancement> {
    // 문장 개선 제안
    const improvements = await this.suggestImprovements(draft);
    
    // 감정 표현 강화
    const emotionalEnhancements = await this.suggestEmotionalWords(draft);
    
    // 감각적 디테일 추가
    const sensoryDetails = await this.suggestSensoryDetails(draft);
    
    return {
      improvements,
      emotionalEnhancements,
      sensoryDetails,
      overallTone: this.analyzeTone(draft)
    };
  }
}
```

### 2. 음성 입력 및 감정 분석
```typescript
class VoiceCommentProcessor {
  async processVoiceComment(audioBlob: Blob): Promise<ProcessedVoiceComment> {
    // 1. 음성을 텍스트로 변환
    const transcription = await this.transcribeAudio(audioBlob);
    
    // 2. 감정 분석
    const emotionAnalysis = await this.analyzeEmotion(audioBlob, transcription.text);
    
    // 3. 키워드 추출
    const keywords = await this.extractKeywords(transcription.text);
    
    // 4. 개선 제안
    const suggestions = await this.generateVoiceSuggestions(transcription.text);
    
    return {
      transcription,
      emotionAnalysis,
      keywords,
      suggestions,
      audioUrl: await this.saveAudio(audioBlob)
    };
  }
  
  private async analyzeEmotion(
    audioBlob: Blob,
    text: string
  ): Promise<EmotionAnalysis> {
    
    // 음성 톤 분석 (피치, 속도, 강도)
    const voiceTone = await this.analyzeVoiceTone(audioBlob);
    
    // 텍스트 감정 분석
    const textEmotion = await this.analyzeTextEmotion(text);
    
    // 감정 매핑
    const emotions = {
      joy: (voiceTone.happiness + textEmotion.positivity) / 2,
      calm: voiceTone.stability * textEmotion.neutrality,
      excitement: voiceTone.energy * textEmotion.intensity,
      nostalgia: textEmotion.memories * 0.8,
      satisfaction: (voiceTone.contentment + textEmotion.satisfaction) / 2
    };
    
    const dominantEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return {
      emotions,
      dominantEmotion,
      confidence: Math.max(...Object.values(emotions)),
      suggestedEmoji: this.getEmotionEmoji(dominantEmotion)
    };
  }
  
  async generateVoiceSuggestions(text: string): Promise<VoiceSuggestion[]> {
    const suggestions: VoiceSuggestion[] = [];
    
    // 반복되는 표현 감지
    const repetitions = this.detectRepetitions(text);
    if (repetitions.length > 0) {
      suggestions.push({
        type: 'variety',
        message: '다양한 표현을 시도해보세요',
        examples: repetitions.map(rep => this.generateAlternatives(rep))
      });
    }
    
    // 감정 표현 부족 감지
    if (this.getEmotionDensity(text) < 0.3) {
      suggestions.push({
        type: 'emotion',
        message: '감정을 더 풍부하게 표현해보세요',
        examples: ['어떤 기분이 드셨나요?', '이 순간이 어떠셨는지 말씀해보세요']
      });
    }
    
    // 구체적 디테일 부족 감지
    if (this.getDetailDensity(text) < 0.4) {
      suggestions.push({
        type: 'detail',
        message: '더 구체적인 묘사를 해보세요',
        examples: ['어떤 맛이 가장 인상적이었나요?', '언제, 어디서 드셨는지 말씀해보세요']
      });
    }
    
    return suggestions;
  }
}
```

### 3. 사진 및 시각적 컨텐츠 처리
```typescript
class VisualCommentProcessor {
  async processCommentPhoto(imageUri: string): Promise<ProcessedPhoto> {
    // 1. 이미지 분석
    const imageAnalysis = await this.analyzeImage(imageUri);
    
    // 2. 자동 캡션 생성
    const suggestedCaptions = await this.generateCaptions(imageAnalysis);
    
    // 3. 색상 팔레트 추출
    const colorPalette = await this.extractColors(imageUri);
    
    // 4. 분위기 분석
    const moodAnalysis = await this.analyzeMood(imageAnalysis, colorPalette);
    
    return {
      imageAnalysis,
      suggestedCaptions,
      colorPalette,
      moodAnalysis,
      processedImageUrl: await this.optimizeImage(imageUri)
    };
  }
  
  private async generateCaptions(analysis: ImageAnalysis): Promise<string[]> {
    const captions: string[] = [];
    
    // 객체 기반 캡션
    if (analysis.detectedObjects.includes('coffee_cup')) {
      captions.push('오늘의 커피와 함께한 순간');
      captions.push('이 한 잔이 주는 특별함');
    }
    
    // 환경 기반 캡션
    if (analysis.detectedObjects.includes('window')) {
      captions.push('창가에서 마시는 여유');
    }
    
    if (analysis.detectedObjects.includes('book')) {
      captions.push('책과 커피, 완벽한 조합');
    }
    
    // 시간대 기반 캡션
    const timeBasedCaptions = {
      morning: ['새로운 하루를 여는 한 잔', '아침 햇살과 함께'],
      afternoon: ['오후의 달콤한 휴식', '잠시 멈춰 선 시간'],
      evening: ['하루를 마무리하는 시간', '저녁의 고요함과 함께'],
      night: ['밤의 깊이를 느끼며', '조용한 나만의 시간']
    };
    
    if (analysis.timeOfDay) {
      captions.push(...timeBasedCaptions[analysis.timeOfDay] || []);
    }
    
    return captions;
  }
  
  async createPhotoStory(photos: CommentPhoto[]): Promise<PhotoStory> {
    if (photos.length < 2) return null;
    
    // 시간순 정렬
    const sortedPhotos = photos.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // 스토리 구성
    const story: PhotoStory = {
      title: this.generateStoryTitle(sortedPhotos),
      chapters: [],
      overallTheme: await this.identifyTheme(sortedPhotos)
    };
    
    // 각 사진별 챕터 생성
    for (let i = 0; i < sortedPhotos.length; i++) {
      const photo = sortedPhotos[i];
      const chapter = {
        photo,
        title: photo.caption || `순간 ${i + 1}`,
        description: await this.generatePhotoDescription(photo, i, sortedPhotos.length),
        transition: i < sortedPhotos.length - 1 ? 
          await this.generateTransition(photo, sortedPhotos[i + 1]) : null
      };
      
      story.chapters.push(chapter);
    }
    
    return story;
  }
}
```

---

## 🎨 UI 컴포넌트 명세

### CreativeWritingEditor 컴포넌트
```typescript
interface CreativeWritingEditorProps {
  initialText?: string;
  context: WritingContext;
  onTextChange: (text: string) => void;
  onInspirationRequest: () => void;
}

const CreativeWritingEditor: React.FC<CreativeWritingEditorProps> = ({
  initialText = '',
  context,
  onTextChange,
  onInspirationRequest
}) => {
  const [text, setText] = useState(initialText);
  const [writingMode, setWritingMode] = useState<'free' | 'template' | 'poetry'>('free');
  const [showInspiration, setShowInspiration] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  const handleTextChange = (newText: string) => {
    setText(newText);
    setWordCount(newText.split(/\s+/).filter(Boolean).length);
    onTextChange(newText);
  };
  
  return (
    <View style={styles.editorContainer}>
      {/* 작성 모드 선택 */}
      <View style={styles.modeSelector}>
        <ModeButton
          mode="free"
          title="자유 작성"
          icon="✏️"
          isActive={writingMode === 'free'}
          onPress={() => setWritingMode('free')}
        />
        <ModeButton
          mode="template"
          title="템플릿"
          icon="📝"
          isActive={writingMode === 'template'}
          onPress={() => setWritingMode('template')}
        />
        <ModeButton
          mode="poetry"
          title="시/산문"
          icon="🎭"
          isActive={writingMode === 'poetry'}
          onPress={() => setWritingMode('poetry')}
        />
      </View>
      
      {/* 텍스트 에디터 */}
      <View style={styles.textAreaContainer}>
        <TextInput
          style={[
            styles.textArea,
            writingMode === 'poetry' && styles.poetryMode
          ]}
          multiline
          value={text}
          onChangeText={handleTextChange}
          placeholder={getPlaceholder(writingMode)}
          placeholderTextColor="#999"
          textAlignVertical="top"
        />
        
        {/* 영감 버튼 */}
        <TouchableOpacity 
          style={styles.inspirationButton}
          onPress={() => setShowInspiration(true)}
        >
          <Text style={styles.inspirationIcon}>💡</Text>
        </TouchableOpacity>
      </View>
      
      {/* 하단 도구 */}
      <View style={styles.bottomTools}>
        <Text style={styles.wordCount}>{wordCount}자</Text>
        <Text style={styles.encouragement}>
          {getEncouragement(wordCount, writingMode)}
        </Text>
      </View>
      
      {/* 영감 모달 */}
      {showInspiration && (
        <InspirationModal
          context={context}
          onInspirationSelect={(inspiration) => {
            setText(prev => prev + inspiration);
            setShowInspiration(false);
          }}
          onClose={() => setShowInspiration(false)}
        />
      )}
    </View>
  );
};
```

### VoiceRecorder 컴포넌트
```typescript
const VoiceRecorder: React.FC<{
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number;
}> = ({ onRecordingComplete, maxDuration = 180 }) => {
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [showTranscription, setShowTranscription] = useState(false);
  
  const startRecording = async () => {
    try {
      await VoiceRecorder.requestPermissions();
      await VoiceRecorder.startRecording({
        language: 'ko-KR',
        partialResults: true,
        maxDuration: maxDuration * 1000
      });
      
      setIsRecording(true);
      
      // 실시간 전사 처리
      VoiceRecorder.onPartialResult((result) => {
        setTranscription(result.text);
      });
      
      // 녹음 시간 업데이트
      const timer = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (error) {
      Alert.alert('오류', '음성 녹음을 시작할 수 없습니다.');
    }
  };
  
  const stopRecording = async () => {
    try {
      const result = await VoiceRecorder.stopRecording();
      setIsRecording(false);
      
      onRecordingComplete(result.audioBlob);
      
    } catch (error) {
      Alert.alert('오류', '녹음을 완료할 수 없습니다.');
    }
  };
  
  return (
    <View style={styles.recorderContainer}>
      {/* 녹음 버튼 */}
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordingButton
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        onLongPress={startRecording}
      >
        <View style={styles.recordButtonInner}>
          <Text style={styles.recordButtonIcon}>
            {isRecording ? '⏹️' : '🎤'}
          </Text>
        </View>
        
        {isRecording && (
          <Animated.View 
            style={[styles.recordingRipple, { 
              opacity: animatedOpacity,
              transform: [{ scale: animatedScale }] 
            }]}
          />
        )}
      </TouchableOpacity>
      
      {/* 녹음 상태 */}
      <View style={styles.recordingStatus}>
        {isRecording ? (
          <Text style={styles.recordingTime}>
            {Math.floor(recordingDuration / 60):02}:{recordingDuration % 60:02}
          </Text>
        ) : (
          <Text style={styles.recordingHint}>
            길게 누르면 녹음이 시작돼요
          </Text>
        )}
      </View>
      
      {/* 실시간 전사 */}
      {transcription && (
        <TouchableOpacity 
          style={styles.transcriptionPreview}
          onPress={() => setShowTranscription(!showTranscription)}
        >
          <Text style={styles.transcriptionText}>
            {showTranscription ? transcription : transcription.substring(0, 50) + '...'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### MoodSelector 컴포넌트
```typescript
const MoodSelector: React.FC<{
  currentMood: MoodState;
  onMoodChange: (mood: MoodState) => void;
}> = ({ currentMood, onMoodChange }) => {
  
  const [showDetailedMood, setShowDetailedMood] = useState(false);
  
  const quickMoods = [
    { emoji: '😊', name: '행복', mood: { happiness: 5, energy: 4, calmness: 4, inspiration: 3 } },
    { emoji: '😌', name: '평온', mood: { happiness: 3, energy: 2, calmness: 5, inspiration: 2 } },
    { emoji: '🤗', name: '따뜻', mood: { happiness: 4, energy: 3, calmness: 4, inspiration: 4 } },
    { emoji: '🥰', name: '만족', mood: { happiness: 5, energy: 3, calmness: 4, inspiration: 3 } },
    { emoji: '🤔', name: '사색', mood: { happiness: 3, energy: 2, calmness: 3, inspiration: 5 } },
    { emoji: '✨', name: '영감', mood: { happiness: 4, energy: 4, calmness: 3, inspiration: 5 } }
  ];
  
  return (
    <View style={styles.moodContainer}>
      <Text style={styles.moodTitle}>😊 지금 기분은?</Text>
      
      {/* 빠른 기분 선택 */}
      <ScrollView horizontal style={styles.quickMoodScroll}>
        {quickMoods.map((moodOption) => (
          <TouchableOpacity
            key={moodOption.name}
            style={[
              styles.moodChip,
              currentMood.emoji === moodOption.emoji && styles.selectedMoodChip
            ]}
            onPress={() => onMoodChange({
              ...moodOption.mood,
              emoji: moodOption.emoji,
              keywords: [moodOption.name]
            })}
          >
            <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
            <Text style={styles.moodName}>{moodOption.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* 상세 조절 토글 */}
      <TouchableOpacity 
        style={styles.detailedMoodToggle}
        onPress={() => setShowDetailedMood(!showDetailedMood)}
      >
        <Text style={styles.detailedMoodToggleText}>
          세부 조절 {showDetailedMood ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {/* 상세 기분 조절 */}
      {showDetailedMood && (
        <View style={styles.detailedMoodContainer}>
          {Object.entries({
            energy: { label: '에너지', icon: '⚡' },
            happiness: { label: '행복감', icon: '😄' },
            calmness: { label: '평온함', icon: '🧘' },
            inspiration: { label: '영감', icon: '💡' }
          }).map(([key, { label, icon }]) => (
            <View key={key} style={styles.moodSliderContainer}>
              <Text style={styles.moodSliderLabel}>
                {icon} {label}
              </Text>
              <Slider
                style={styles.moodSlider}
                value={currentMood[key] || 3}
                onValueChange={(value) => 
                  onMoodChange({
                    ...currentMood,
                    [key]: Math.round(value)
                  })
                }
                minimumValue={1}
                maximumValue={5}
                step={1}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
```

---

## 🧪 테스트 전략

### 창작 도구 테스트
```typescript
describe('PersonalComment Creation Tools', () => {
  test('텍스트 입력 및 자동 저장', () => {
    const { getByTestId } = render(<CreativeWritingEditor />);
    const textInput = getByTestId('text-input');
    
    fireEvent.changeText(textInput, '오늘의 커피는 정말 특별했어요');
    
    // 자동 저장 확인
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        textContent: '오늘의 커피는 정말 특별했어요'
      })
    );
  });
  
  test('음성 녹음 및 전사', async () => {
    const { getByTestId } = render(<VoiceRecorder />);
    const recordButton = getByTestId('record-button');
    
    // 녹음 시작
    fireEvent.press(recordButton);
    expect(mockVoiceRecorder.startRecording).toHaveBeenCalled();
    
    // 녹음 중 상태 확인
    expect(getByTestId('recording-status')).toHaveTextContent('녹음 중');
    
    // 전사 결과 모의
    mockVoiceRecorder.onPartialResult('이 커피는 너무 맛있어요');
    
    await waitFor(() => {
      expect(getByTestId('transcription-preview')).toBeVisible();
    });
  });
  
  test('기분 선택 및 상태 업데이트', () => {
    const mockOnMoodChange = jest.fn();
    const { getByTestId } = render(
      <MoodSelector currentMood={{}} onMoodChange={mockOnMoodChange} />
    );
    
    fireEvent.press(getByTestId('mood-happy'));
    
    expect(mockOnMoodChange).toHaveBeenCalledWith(
      expect.objectContaining({
        happiness: 5,
        emoji: '😊'
      })
    );
  });
});
```

### 개인화 및 학습 테스트
```typescript
describe('Personal Comment Learning', () => {
  test('개인 패턴 학습', async () => {
    const userId = 'test-user';
    const comment = {
      textContent: '아침 햇살과 함께 마신 따뜻한 커피',
      mood: { happiness: 4, energy: 4, calmness: 5 }
    };
    
    await PersonalCommentService.analyzeAndLearn(userId, comment);
    
    const patterns = await PersonalCommentService.getUserPatterns(userId);
    expect(patterns.preferredMoods).toContain('calm');
    expect(patterns.favoriteTopics).toContain('morning');
  });
  
  test('창작 스타일 분석', () => {
    const comments = [
      { textContent: '부드러운 아침의 시작...', type: 'poetry' },
      { textContent: '오늘 마신 커피는 정말 좋았다', type: 'simple' },
      { textContent: '햇살처럼 따뜻한 한 잔', type: 'metaphor' }
    ];
    
    const style = PersonalCommentService.analyzeWritingStyle(comments);
    expect(style.dominantStyle).toBe('metaphor');
    expect(style.poetryTendency).toBeGreaterThan(0.6);
  });
});
```

---

## 📊 성공 지표

### 핵심 KPI
- **참여율**: > 35% (완전 선택 단계이므로 낮은 목표)
- **평균 작성 시간**: 3-8분
- **재방문 및 편집률**: > 25%
- **음성 녹음 사용률**: > 15%
- **사진 첨부율**: > 20%
- **즐겨찾기 등록률**: > 40%

### 창작 품질 지표
```typescript
const creativityMetrics = {
  contentQuality: {
    averageWordCount: number,           // 평균 단어 수
    creativityScore: number,            // 창의성 점수
    emotionalDepth: number,             // 감정 깊이
    originalityIndex: number,           // 독창성 지수
  },
  
  engagementMetrics: {
    revisitRate: number,                // 다시 읽기 비율
    shareRate: number,                  // 공유 비율 (허용 시)
    inspirationToolUsage: number,       // 영감 도구 사용률
    multiModalUsage: number,           // 다중 입력 방식 사용률
  },
  
  personalGrowth: {
    vocabularyExpansion: number,        // 어휘 확장율
    emotionalExpressionImprovement: number, // 감정 표현 개선
    consistencyInStyle: number,         // 스타일 일관성
    experimentationRate: number,        // 새로운 방식 시도율
  }
};
```

---

## 🚀 향후 개선 계획

### Phase 1 (현재)
- ✅ 기본 텍스트 입력
- ✅ 음성 녹음 및 전사
- 🔧 기분 상태 추적
- 🔧 사진 첨부 기능

### Phase 2 (3개월)
- 🔄 AI 창작 도우미
- 🔄 실시간 감정 분석
- 🔄 개인화된 템플릿
- 🔄 창작 스타일 학습

### Phase 3 (6개월)  
- 🔄 협업 창작 기능
- 🔄 시각적 스토리텔링
- 🔄 음성 감정 분석
- 🔄 개인 창작 아카이브

### Phase 4 (고도화)
- 🔄 AI 기반 시/산문 생성
- 🔄 개인 창작 DNA 분석
- 🔄 창작 커뮤니티 연결
- 🔄 멀티미디어 스토리 생성

---

## 💡 창작 영감 데이터베이스

### 감각적 은유 라이브러리
```typescript
const metaphorLibrary = {
  taste: {
    sweet: ['꿀처럼 달콤한', '설탕 구름 같은', '엄마의 사랑 같은'],
    bitter: ['인생의 쓴맛 같은', '어른의 여유 같은', '깊은 성찰 같은'],
    sour: ['새벽 이슬 같은', '청춘의 상큼함 같은', '봄바람 같은']
  },
  
  texture: {
    smooth: ['실크처럼 부드러운', '구름 위를 걷는', '모래사장 같은'],
    thick: ['벨벳 커튼 같은', '따뜻한 포옹 같은', '겨울 담요 같은'],
    light: ['하늘을 나는', '깃털처럼 가벼운', '바람결 같은']
  },
  
  emotion: {
    comfort: ['집에 돌아온', '오랜 친구를 만난', '포근한 휴식 같은'],
    energy: ['새로운 시작의', '모험을 떠나는', '활력 넘치는'],
    peace: ['고요한 호수 같은', '명상하는', '평온한 저녁 같은']
  }
};
```

---

이 문서는 Personal Comment 단계의 완전한 구현 가이드입니다. 사용자의 창의적 표현과 개인적 성찰을 돕는 다양한 도구와 기능을 제공합니다.