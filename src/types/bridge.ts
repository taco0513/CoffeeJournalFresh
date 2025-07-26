/**
 * Bridge-related type definitions for React Native
 */

export type BridgeParam = string | number | boolean | null | undefined | BridgeParam[] | { [key: string]: BridgeParam };

export interface BridgeCall {
  moduleId: number;
  methodId: number;
  params: BridgeParam[];
  timestamp: number;
}

export type BridgeCallback = (error?: Error) => void;

export interface NativeBridge {
  enqueueNativeCall: (
    moduleID: number, 
    methodID: number, 
    params: BridgeParam[], 
    onFail?: BridgeCallback, 
    onSucc?: BridgeCallback
  ) => void;
  getCallableModule: (name: string) => { [key: string]: number } | null;
  _remoteModuleTable: { 
    [key: string]: { 
      moduleID: number; 
      methods: { [key: string]: number };
      name?: string;
  } 
};
  _remoteMethodTable: { [key: string]: string[] };
}

export interface ModuleInfo {
  moduleID: number;
  name?: string;
  methods: { [key: string]: number };
}

export interface AnalyzedParam {
  original: BridgeParam;
  sanitized: BridgeParam;
  isProblematic: boolean;
  reason?: string;
}