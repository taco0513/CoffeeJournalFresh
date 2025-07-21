/**
 * Bridge Error Debugger for React Native 0.80+
 * Helps identify sources of "Malformed calls from JS" errors
 */

interface BridgeCall {
  moduleId: number;
  methodId: number;
  params: any[];
  timestamp: number;
}

class BridgeDebugger {
  private calls: BridgeCall[] = [];
  private originalBridge: any = null;
  private maxCalls = 50; // Keep last 50 calls for debugging

  init() {
    if (__DEV__ && global.__fbBatchedBridge) {
      this.originalBridge = global.__fbBatchedBridge;
      this.interceptBridgeCalls();
      console.log('🔍 Bridge debugger initialized');
    }
  }

  private interceptBridgeCalls() {
    if (!this.originalBridge) return;

    const originalEnqueueNativeCall = this.originalBridge.enqueueNativeCall;
    
    this.originalBridge.enqueueNativeCall = (moduleID: number, methodID: number, params: any[], onFail?: Function, onSucc?: Function) => {
      // Log the call
      this.logCall(moduleID, methodID, params);
      
      // Validate parameters before sending to native
      const sanitizedParams = this.sanitizeParams(params);
      
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
        console.error('🚨 Bridge call failed:', {
          moduleID,
          methodID,
          params,
          error: error.message,
          moduleName: this.getModuleName(moduleID),
          methodName: this.getMethodName(moduleID, methodID)
        });
        throw error;
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
      console.warn('⚠️ Potentially problematic bridge call:', {
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
        console.warn('🔧 Sanitized invalid number:', param, '→ 0');
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
    console.group('🔍 Recent Bridge Calls');
    recent.forEach((call, index) => {
      console.log(`${index + 1}. ${this.getModuleName(call.moduleId)}.${this.getMethodName(call.moduleId, call.methodId)}`, call.params);
    });
    console.groupEnd();
  }
}

export const bridgeDebugger = new BridgeDebugger();

// Auto-initialize in development
if (__DEV__) {
  bridgeDebugger.init();
}