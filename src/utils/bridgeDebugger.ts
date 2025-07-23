/**
 * Bridge Error Debugger for React Native 0.80+
 * Helps identify sources of "Malformed calls from JS" errors
 */

// Debug configuration
const DEBUG_ENABLED = __DEV__ && !process.env.DISABLE_BRIDGE_DEBUGGER;
const LOG_PREFIX = '[BridgeDebugger]';

// Debug logging wrapper
const debugLog = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.log(LOG_PREFIX, ...args);
  }
};

const debugWarn = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.warn(LOG_PREFIX, ...args);
  }
};

const debugError = (...args: any[]) => {
  if (DEBUG_ENABLED) {
    console.error(LOG_PREFIX, ...args);
  }
};

interface BridgeCall {
  moduleId: number;
  methodId: number;
  params: unknown[];
  timestamp: number;
}

interface NativeBridge {
  enqueueNativeCall: (moduleID: number, methodID: number, params: unknown[], onFail?: Function, onSucc?: Function) => void;
  getCallableModule: (name: string) => { [key: string]: number } | null;
  _remoteModuleTable: { [key: string]: { moduleID: number; methods: { [key: string]: number } } };
  _remoteMethodTable: { [key: string]: string[] };
}

class BridgeDebugger {
  private calls: BridgeCall[] = [];
  private originalBridge: NativeBridge | null = null;
  private maxCalls = 50; // Keep last 50 calls for debugging

  init() {
    if (__DEV__ && (global as any).__fbBatchedBridge) {
      try {
        this.originalBridge = (global as any).__fbBatchedBridge;
        this.interceptBridgeCalls();
        debugLog('🔍 Bridge debugger initialized');
      } catch (error) {
        debugWarn('⚠️ Bridge debugger initialization failed, continuing without debugging:', error.message);
      }
    }
  }

  private interceptBridgeCalls() {
    if (!this.originalBridge) return;

    const originalEnqueueNativeCall = this.originalBridge.enqueueNativeCall;
    
    this.originalBridge.enqueueNativeCall = (moduleID: number, methodID: number, params: unknown[], onFail?: Function, onSucc?: Function) => {
      // Log the call
      this.logCall(moduleID, methodID, params);
      
      // Validate parameters before sending to native
      const sanitizedParams = this.sanitizeParams(params);
      
      // Check if this is a known problematic method and handle gracefully
      const methodName = this.getMethodName(moduleID, methodID);
      const moduleName = this.getModuleName(moduleID);
      
      // Block known problematic calls that reference non-existent native methods
      if (methodName.includes('onRequestCategoryPreferencing') || 
          moduleName.includes('TastingFlow') ||
          methodName.includes('CategoryPreferencing')) {
        debugWarn('🚨 Blocked potentially problematic bridge call:', {
          moduleName,
          methodName,
          reason: 'Method likely does not exist in native binary'
        });
        
        // Call onFail if provided to handle gracefully
        if (onFail && typeof onFail === 'function') {
          onFail(new Error(`Method ${methodName} not found in native binary`));
        }
        return;
      }
      
      try {
        return originalEnqueueNativeCall.call(
          this.originalBridge, 
          moduleID, 
          methodID, 
          sanitizedParams, 
          onFail, 
          onSucc
        );
      } catch (error) {
        debugError('🚨 Bridge call failed:', {
          moduleID,
          methodID,
          params,
          error: error.message,
          moduleName: this.getModuleName(moduleID),
          methodName: this.getMethodName(moduleID, methodID)
        });
        
        // Handle the error gracefully instead of throwing
        if (onFail && typeof onFail === 'function') {
          onFail(error);
        } else {
          debugWarn('🔄 Bridge call failed but no error handler provided, continuing...');
        }
      }
    };
  }

  private logCall(moduleID: number, methodID: number, params: any[]) {
    const call: BridgeCall = {
      moduleId: moduleID,
      methodId: methodID,
      params,
      timestamp: Date.now()
    };

    this.calls.push(call);
    
    // Keep only recent calls
    if (this.calls.length > this.maxCalls) {
      this.calls = this.calls.slice(-this.maxCalls);
    }

    // Log potentially problematic calls
    if (this.hasProblematicParams(params)) {
      debugWarn('⚠️ Potentially problematic bridge call:', {
        module: this.getModuleName(moduleID),
        method: this.getMethodName(moduleID, methodID),
        params: this.analyzeParams(params)
      });
    }
  }

  private sanitizeParams(params: any[]): any[] {
    return params.map(param => this.sanitizeParam(param));
  }

  private sanitizeParam(param: any): any {
    if (param === null || param === undefined) {
      return param;
    }

    if (typeof param === 'number') {
      if (isNaN(param) || !isFinite(param)) {
        debugWarn('🔧 Sanitized invalid number:', param, '→ 0');
        return 0;
      }
      return param;
    }

    if (Array.isArray(param)) {
      return param.map(item => this.sanitizeParam(item));
    }

    if (typeof param === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(param)) {
        sanitized[key] = this.sanitizeParam(value);
      }
      return sanitized;
    }

    return param;
  }

  private hasProblematicParams(params: any[]): boolean {
    return params.some(param => this.isProblematicParam(param));
  }

  private isProblematicParam(param: any): boolean {
    if (typeof param === 'number' && (isNaN(param) || !isFinite(param))) {
      return true;
    }
    
    if (Array.isArray(param)) {
      return param.some(item => this.isProblematicParam(item));
    }
    
    if (param && typeof param === 'object') {
      return Object.values(param).some(value => this.isProblematicParam(value));
    }
    
    return false;
  }

  private analyzeParams(params: any[]): any {
    return params.map(param => {
      if (typeof param === 'number' && (isNaN(param) || !isFinite(param))) {
        return `[INVALID NUMBER: ${param}]`;
      }
      if (Array.isArray(param)) {
        return param.map(item => typeof item === 'number' && (isNaN(item) || !isFinite(item)) ? `[INVALID: ${item}]` : item);
      }
      return param;
    });
  }

  private getModuleName(moduleID: number): string {
    if (!this.originalBridge?._remoteModuleTable) return `Module${moduleID}`;
    return this.originalBridge._remoteModuleTable[moduleID] || `Module${moduleID}`;
  }

  private getMethodName(moduleID: number, methodID: number): string {
    if (!this.originalBridge?._remoteMethodTable) return `Method${methodID}`;
    const methods = this.originalBridge._remoteMethodTable[moduleID];
    return methods?.[methodID] || `Method${methodID}`;
  }

  getRecentCalls(count = 10): BridgeCall[] {
    return this.calls.slice(-count);
  }

  printRecentCalls(count = 10) {
    const recent = this.getRecentCalls(count);
    if (DEBUG_ENABLED) {
      console.group(LOG_PREFIX + ' 🔍 Recent Bridge Calls');
      recent.forEach((call, index) => {
        console.log(`${index + 1}. ${this.getModuleName(call.moduleId)}.${this.getMethodName(call.moduleId, call.methodId)}`, call.params);
      });
      console.groupEnd();
    }
  }
}

export const bridgeDebugger = new BridgeDebugger();

// Auto-initialize in development (can be disabled by setting DISABLE_BRIDGE_DEBUGGER=true)
if (DEBUG_ENABLED) {
  try {
    bridgeDebugger.init();
  } catch (error) {
    debugWarn('⚠️ Bridge debugger failed to initialize, continuing without debugging:', error.message);
  }
}