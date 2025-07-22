import { Platform } from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { parseMLKitResult, ParsedCoffeeInfo } from '../utils/ocrParser';

interface OCRResult {
  text: string;
  confidence: number;
  blocks?: any[];
}

class OCRService {
  private static instance: OCRService;
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async recognizeText(imagePath: string): Promise<OCRResult> {
    try {
      // Use ML Kit for both iOS and Android
      const result = await TextRecognition.recognize(imagePath);
      
      // Extract full text and blocks
      const fullText = result.blocks.map((block: any) => block.text).join('\n');
      
      return {
        text: fullText,
        confidence: 0.9, // ML Kit doesn't provide overall confidence
        blocks: result.blocks
      };
    } catch (error) {
      // console.error('ML Kit Text Recognition Error:', error);
      return { text: '', confidence: 0, blocks: [] };
    }
  }

  // New method to parse ML Kit result directly
  async recognizeAndParse(imagePath: string): Promise<ParsedCoffeeInfo> {
    try {
      const result = await TextRecognition.recognize(imagePath);
      return parseMLKitResult(result.blocks);
    } catch (error) {
      // console.error('ML Kit Recognition and Parse Error:', error);
      return {};
    }
  }

  // Legacy method - now delegates to ocrParser
  parseCoffeeInfo(text: string): ParsedCoffeeInfo {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Use the improved parser from ocrParser.ts
    const { parseOCRResult } = require('../utils/ocrParser');
    return parseOCRResult(lines);
  }

  // Clean up extracted text
  private cleanText(text: string): string {
    return text
      .replace(/[^\w\s가-힣]/g, ' ') // Keep only alphanumeric, spaces, and Korean characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Validate extracted information
  validateExtractedInfo(info: ParsedCoffeeInfo): ParsedCoffeeInfo {
    const validated: ParsedCoffeeInfo = {};

    // Validate coffee name
    if (info.coffeeName && info.coffeeName.length > 2 && info.coffeeName.length < 100) {
      validated.coffeeName = this.cleanText(info.coffeeName);
    }

    // Validate roastery
    if (info.roastery && info.roastery.length > 2 && info.roastery.length < 50) {
      validated.roastery = this.cleanText(info.roastery);
    }

    // Validate origin
    if (info.origin && info.origin.length > 2 && info.origin.length < 50) {
      validated.origin = this.cleanText(info.origin);
    }

    // Validate variety
    if (info.variety && info.variety.length > 2 && info.variety.length < 30) {
      validated.variety = this.cleanText(info.variety);
    }

    // Validate process
    if (info.process && info.process.length > 2 && info.process.length < 30) {
      validated.process = this.cleanText(info.process);
    }

    // Validate altitude
    if (info.altitude && info.altitude.length > 1 && info.altitude.length < 20) {
      validated.altitude = this.cleanText(info.altitude);
    }

    return validated;
  }
}

export default OCRService;
export type { OCRResult, ParsedCoffeeInfo };