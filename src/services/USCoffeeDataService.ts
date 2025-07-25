// import { isUSBetaMarket } from './i18n'; // Function not available in current setup
const isUSBetaMarket = () => false; // Temporary stub

/**
 * US Coffee Data Service for Beta Users
 * Provides coffee-related data specific to US market
 */

export interface USRoaster {
  name: string;
  location: string;
  founded: number;
  specialty: string[];
  website?: string;
}

export interface USCoffeeName {
  name: string;
  roaster: string;
  origin: string;
  notes: string[];
}

export interface USCafeChain {
  name: string;
  locations: number;
  specialty: string;
  founded: number;
}

export class USCoffeeDataService {
  private static instance: USCoffeeDataService;

  private constructor() {}

  static getInstance(): USCoffeeDataService {
    if (!USCoffeeDataService.instance) {
      USCoffeeDataService.instance = new USCoffeeDataService();
    }
    return USCoffeeDataService.instance;
  }

  /**
   * Popular US Roasters for autocomplete suggestions
   */
  getPopularRoasters(): USRoaster[] {
    if (!isUSBetaMarket()) return [];

    return [
      {
        name: 'Blue Bottle Coffee',
        location: 'Oakland, CA',
        founded: 2002,
        specialty: ['Third Wave', 'Single Origin', 'Direct Trade'],
        website: 'https://bluebottlecoffee.com'
      },
      {
        name: 'Stumptown Coffee Roasters',
        location: 'Portland, OR',
        founded: 1999,
        specialty: ['Craft Roasting', 'Direct Trade', 'Cold Brew'],
        website: 'https://stumptowncoffee.com'
      },
      {
        name: 'Intelligentsia Coffee',
        location: 'Chicago, IL',
        founded: 1995,
        specialty: ['Direct Trade', 'Single Origin', 'Espresso'],
        website: 'https://intelligentsiacoffee.com'
      },
      {
        name: 'Counter Culture Coffee',
        location: 'Durham, NC',
        founded: 1995,
        specialty: ['Sustainable Sourcing', 'Education', 'Single Origin'],
        website: 'https://counterculturecoffee.com'
      },
      {
        name: 'Verve Coffee Roasters',
        location: 'Santa Cruz, CA',
        founded: 2007,
        specialty: ['Single Origin', 'Seasonal Blends', 'Direct Trade'],
        website: 'https://vervecoffee.com'
      },
      {
        name: 'La Colombe Coffee Roasters',
        location: 'Philadelphia, PA',
        founded: 1994,
        specialty: ['Draft Latte', 'Single Origin', 'Blends'],
        website: 'https://lacolombe.com'
      },
      {
        name: 'Ritual Coffee Roasters',
        location: 'San Francisco, CA',
        founded: 2005,
        specialty: ['Single Origin', 'Espresso', 'Pour Over'],
        website: 'https://ritualcoffee.com'
      },
    ];
  }

  /**
   * Popular US Coffee Names for suggestions
   */
  getPopularCoffeeNames(): USCoffeeName[] {
    if (!isUSBetaMarket()) return [];

    return [
      {
        name: 'Three Africas',
        roaster: 'Blue Bottle Coffee',
        origin: 'Blend',
        notes: ['Chocolate', 'Berry', 'Wine']
      },
      {
        name: 'Hair Bender',
        roaster: 'Stumptown Coffee Roasters',
        origin: 'Blend',
        notes: ['Citrus', 'Chocolate', 'Sweet']
      },
      {
        name: 'Black Cat',
        roaster: 'Intelligentsia Coffee',
        origin: 'Blend',
        notes: ['Dark Chocolate', 'Molasses', 'Smoky']
      },
      {
        name: 'Hologram',
        roaster: 'Counter Culture Coffee',
        origin: 'Blend',
        notes: ['Caramel', 'Citrus', 'Chocolate']
      },
      {
        name: 'Streetlevel',
        roaster: 'Verve Coffee Roasters',
        origin: 'Blend',
        notes: ['Chocolate', 'Caramel', 'Balanced']
      },
    ];
  }

  /**
   * US Cafe Chains for cafe name suggestions
   */
  getPopularCafeChains(): USCafeChain[] {
    if (!isUSBetaMarket()) return [];

    return [
      {
        name: 'Starbucks',
        locations: 15000,
        specialty: 'Global Chain',
        founded: 1971
      },
      {
        name: 'Dunkin\'',
        locations: 9000,
        specialty: 'Coffee & Donuts',
        founded: 1950
      },
      {
        name: 'Peet\'s Coffee',
        locations: 400,
        specialty: 'Premium Coffee',
        founded: 1966
      },
      {
        name: 'Caribou Coffee',
        locations: 300,
        specialty: 'Coffeehouse',
        founded: 1992
      },
      {
        name: 'The Coffee Bean & Tea Leaf',
        locations: 1000,
        specialty: 'Coffee & Tea',
        founded: 1963
      },
    ];
  }

  /**
   * Get coffee origins popular in US market
   */
  getPopularOrigins(): string[] {
    if (!isUSBetaMarket()) return [];

    return [
      'Colombia',
      'Ethiopia',
      'Guatemala',
      'Costa Rica',
      'Kenya',
      'Brazil',
      'Peru',
      'Honduras',
      'Panama',
      'Jamaica',
      'Mexico',
      'Indonesia',
      'Yemen',
      'Nicaragua',
      'Ecuador'
    ];
  }

  /**
   * Get coffee varieties popular in US market
   */
  getPopularVarieties(): string[] {
    if (!isUSBetaMarket()) return [];

    return [
      'Bourbon',
      'Typica',
      'Caturra',
      'Catuai',
      'Geisha/Gesha',
      'SL28',
      'SL34',
      'Pacamara',
      'Mundo Novo',
      'Villa Sarchi',
      'Red Bourbon',
      'Yellow Bourbon',
      'Heirloom',
      'Java',
      'Maragogype'
    ];
  }

  /**
   * Get processing methods popular in US market
   */
  getPopularProcessMethods(): string[] {
    if (!isUSBetaMarket()) return [];

    return [
      'Washed',
      'Natural',
      'Honey Process',
      'Semi-Washed',
      'Wet Hulled',
      'Anaerobic',
      'Carbonic Maceration',
      'Extended Fermentation',
      'Double Fermentation',
      'White Honey',
      'Red Honey',
      'Black Honey',
      'Yellow Honey'
    ];
  }

  /**
   * Get flavor notes common in US coffee descriptions
   */
  getCommonFlavorNotes(): string[] {
    if (!isUSBetaMarket()) return [];

    return [
      // Fruity
      'Blueberry', 'Strawberry', 'Cherry', 'Apple', 'Orange', 'Lemon',
      'Lime', 'Grapefruit', 'Peach', 'Apricot', 'Grape', 'Blackberry',
      
      // Nutty & Sweet
      'Chocolate', 'Caramel', 'Vanilla', 'Honey', 'Brown Sugar',
      'Almond', 'Hazelnut', 'Walnut', 'Peanut', 'Toffee',
      
      // Spicy & Herbal
      'Cinnamon', 'Nutmeg', 'Clove', 'Cardamom', 'Ginger',
      'Thyme', 'Rosemary', 'Mint', 'Basil',
      
      // Other
      'Wine', 'Tea', 'Tobacco', 'Cedar', 'Floral', 'Jasmine',
      'Rose', 'Bergamot', 'Earl Grey', 'Black Tea'
    ];
  }

  /**
   * Search functionality for US data
   */
  searchRoasters(query: string): USRoaster[] {
    if (!isUSBetaMarket() || !query) return [];

    const roasters = this.getPopularRoasters();
    return roasters.filter(roaster => 
      roaster.name.toLowerCase().includes(query.toLowerCase()) ||
      roaster.location.toLowerCase().includes(query.toLowerCase())
    );
  }

  searchCoffeeNames(query: string): USCoffeeName[] {
    if (!isUSBetaMarket() || !query) return [];

    const coffees = this.getPopularCoffeeNames();
    return coffees.filter(coffee => 
      coffee.name.toLowerCase().includes(query.toLowerCase()) ||
      coffee.roaster.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get market-specific greeting messages
   */
  getMarketSpecificMessages(): string[] {
    if (!isUSBetaMarket()) return [];

    return [
      'Welcome to CupNote Beta!',
      'Discover your coffee taste preferences',
      'Track your coffee journey',
      'Rate and remember great coffees',
      'Build your personal coffee profile'
    ];
  }

  /**
   * Check if US beta features should be shown
   */
  shouldShowUSFeatures(): boolean {
    return isUSBetaMarket();
  }
}

export default USCoffeeDataService;