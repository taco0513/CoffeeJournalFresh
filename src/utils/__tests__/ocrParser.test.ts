import { parseOCRResult, parseMLKitResult } from '../ocrParser';

describe('OCR Parser Tests', () => {
  describe('parseOCRResult', () => {
    it('should parse STEREOSCOPE coffee label correctly', () => {
      const texts = [
        'STEREOSCOPE',
        'Guava Candy',
        'COLOMBIA',
        'Region',
        'Planadas, Tolima',
        'Process',
        'Washed',
        'Varietal',
        'Pink Bourbon',
        'Notes',
        'Tropical fruit, guava,',
        'passionfruit, creamy'
      ];

      const result = parseOCRResult(texts);
      
      expect(result.roastery).toBe('STEREOSCOPE');
      expect(result.coffeeName).toBe('Guava Candy');
      expect(result.origin).toBe('COLOMBIA');
      expect(result.process).toBe('Washed');
      expect(result.variety).toBe('Pink Bourbon');
      expect(result.roasterNotes).toContain('guava');
      expect(result.roasterNotes).toContain('passionfruit');
    });

    it('should fix common OCR errors', () => {
      const texts = [
        'STEROSCOPE', // Missing E
        'Natural1y Processed', // 1 instead of l
        'sI28', // Common SL28 error
        'Process',
        'Wash3d', // 3 instead of e
        'Altitude',
        '1500 m', // Space before m
        'Notes',
        'Cherry, chocolate, wine'
      ];

      const result = parseOCRResult(texts);
      
      expect(result.roastery).toBe('STEREOSCOPE');
      expect(result.process).toBe('Washed');
      expect(result.altitude).toBe('1500m');
    });

    it('should parse complex multi-line notes', () => {
      const texts = [
        'Blue Bottle Coffee',
        'Ethiopia Yirgacheffe',
        'ETHIOPIA',
        'Process',
        'Natural',
        'Tasting Notes',
        'Blueberry, dark chocolate,',
        'red wine, floral,',
        'complex and fruity finish'
      ];

      const result = parseOCRResult(texts);
      
      expect(result.roastery).toBe('Blue Bottle Coffee');
      expect(result.coffeeName).toBe('Ethiopia Yirgacheffe');
      expect(result.roasterNotes).toBe('Blueberry, dark chocolate, red wine, floral, complex and fruity finish');
    });

    it('should handle Korean text', () => {
      const texts = [
        '스테레오스코프',
        '에티오피아 구지',
        '생산지',
        '에티오피아',
        '가공',
        '워시드',
        '품종',
        'Heirloom',
        '고도',
        '1950-2100m'
      ];

      const result = parseOCRResult(texts);
      
      expect(result.coffeeName).toBe('에티오피아 구지');
      expect(result.variety).toBe('Heirloom');
      expect(result.altitude).toBe('1950-2100m');
    });

    it('should extract farm and producer info', () => {
      const texts = [
        'Coffee Collective',
        'La Esperanza',
        'COLOMBIA',
        'Farm',
        'Finca La Esperanza',
        'Producer',
        'Luis Martinez',
        'Harvest',
        '2023/2024',
        'Process',
        'Anaerobic'
      ];

      const result = parseOCRResult(texts);
      
      expect(result.roastery).toBe('Coffee Collective');
      expect(result.coffeeName).toBe('La Esperanza');
      expect(result.farm).toBe('Finca La Esperanza');
      expect(result.producer).toBe('Luis Martinez');
      expect(result.harvest).toBe('2023/2024');
      expect(result.process).toBe('Anaerobic');
    });
  });

  describe('parseMLKitResult', () => {
    it('should parse ML Kit blocks with positioning', () => {
      const mlKitBlocks = [
        {
          text: 'STEREOSCOPE',
          frame: { origin: { y: 10 } }
        },
        {
          text: 'Kenya Gachatha',
          frame: { origin: { y: 30 } }
        },
        {
          text: 'KENYA\\nRegion: Nyeri\\nProcess: Washed',
          frame: { origin: { y: 50 } }
        },
        {
          text: 'Variety: SL28, SL34\\nAltitude: 1700-1800 masl',
          frame: { origin: { y: 100 } }
        },
        {
          text: 'Notes: Blackcurrant, tomato, bright acidity',
          frame: { origin: { y: 150 } }
        }
      ];

      const result = parseMLKitResult(mlKitBlocks);
      
      expect(result.roastery).toBe('STEREOSCOPE');
      expect(result.coffeeName).toBe('Kenya Gachatha');
      expect(result.origin).toBe('KENYA');
      expect(result.variety).toBe('SL28, SL34');
      expect(result.altitude).toBe('1700-1800 masl');
      expect(result.process).toBe('Washed');
      expect(result.roasterNotes).toContain('Blackcurrant');
    });

    it('should handle blocks in random order', () => {
      const mlKitBlocks = [
        {
          text: 'Notes: Floral, honey, citrus',
          frame: { origin: { y: 150 } }
        },
        {
          text: 'Process: Honey',
          frame: { origin: { y: 100 } }
        },
        {
          text: 'COFFEE COLLECTIVE',
          frame: { origin: { y: 10 } }
        },
        {
          text: 'Costa Rica Las Lajas',
          frame: { origin: { y: 30 } }
        },
        {
          text: 'COSTA RICA',
          frame: { origin: { y: 50 } }
        }
      ];

      const result = parseMLKitResult(mlKitBlocks);
      
      expect(result.roastery).toBe('COFFEE COLLECTIVE');
      expect(result.coffeeName).toBe('Costa Rica Las Lajas');
      expect(result.origin).toBe('COSTA RICA');
      expect(result.process).toBe('Honey');
      expect(result.roasterNotes).toContain('Floral');
    });
  });
});