/**
 * Category Utility Functions
 * Handles category name formatting and display
 */

// Category name mapping for better display
const CATEGORY_NAME_MAP = {
  // 'carsharing': 'Transport & Sharing Concepts',
  // 'medical': 'Health & Medical',
  // 'education': 'Education & Learning',
  // 'software': 'Technology & Software',
  // 'agriculture': 'Agriculture & Farming',
  // 'business': 'Business & Entrepreneurship',
  // 'technology': 'Technology',
  // 'health-wellness': 'Health & Wellness',
  // 'finance': 'Finance & Banking',
  // 'environment': 'Environment & Sustainability',
  // 'entertainment': 'Entertainment & Media',
  // 'sports': 'Sports & Fitness',
  // 'food': 'Food & Beverage',
  // 'fashion': 'Fashion & Lifestyle',
  // 'realestate': 'Real Estate & Property',
  // 'travel': 'Travel & Tourism',
  // 'manufacturing': 'Manufacturing & Industry',
};

/**
 * Convert category name to display format
 * @param {string} categoryName - The category name from API (lowercase, no spaces)
 * @returns {string} - Formatted display name
 */
export const formatCategoryName = (categoryName) => {
  if (!categoryName) return 'Uncategorized';
  
  // Ensure categoryName is a string
  const nameStr = typeof categoryName === 'string' ? categoryName : String(categoryName);
  
  // Check if we have a custom mapping
  const normalized = nameStr.toLowerCase().trim();
  if (CATEGORY_NAME_MAP[normalized]) {
    return CATEGORY_NAME_MAP[normalized];
  }
  
  // Auto-format: capitalize first letter of each word and replace underscores/hyphens with spaces
  return nameStr
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Convert display name back to API format (lowercase, no spaces)
 * @param {string} displayName - The formatted display name
 * @returns {string} - API-compatible category name
 */
export const formatCategoryKey = (displayName) => {
  if (!displayName) return 'uncategorized';
  
  // Find reverse mapping
  const normalized = displayName.toLowerCase();
  const reverseEntry = Object.entries(CATEGORY_NAME_MAP).find(
    ([key, value]) => value.toLowerCase() === normalized
  );
  
  if (reverseEntry) {
    return reverseEntry[0];
  }
  
  // Convert display name to key format
  return displayName.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
};

/**
 * Get icon name for category (for future use with react-icons)
 * @param {string} categoryName - The category name from API
 * @returns {string} - Icon identifier
 */
export const getCategoryIcon = (categoryName) => {
  const normalized = categoryName?.toLowerCase() || '';
  
  const iconMap = {
    'carsharing': 'FaCar',
    'medical': 'FaHeartbeat',
    'education': 'FaGraduationCap',
    'software': 'FaCode',
    'agriculture': 'FaSeedling',
    'business': 'FaBriefcase',
    'technology': 'FaCog',
    'health-wellness': 'FaHeart',
    'finance': 'FaDollarSign',
    'environment': 'FaLeaf',
    'entertainment': 'FaFilm',
    'sports': 'FaFootballBall',
    'food': 'FaUtensils',
    'fashion': 'FaTshirt',
    'realestate': 'FaHome',
    'travel': 'FaPlane',
    'manufacturing': 'FaIndustry',
    'uncategorized': 'FaQuestionCircle',
  };
  
  return iconMap[normalized] || 'FaLightbulb';
};

/**
 * Create default categories structure
 * @returns {Array} - Array of default category objects
 */
export const getDefaultCategories = () => [
  { id: 'all-ideas', name: 'all', displayName: 'All Ideas', idea_count: 0 },
  { id: 1, name: 'technology', displayName: 'Technology', idea_count: 0 },
  { id: 2, name: 'business', displayName: 'Business & Entrepreneurship', idea_count: 0 },
  { id: 3, name: 'education', displayName: 'Education & Learning', idea_count: 0 },
  { id: 4, name: 'health-wellness', displayName: 'Health & Wellness', idea_count: 0 },
];

/**
 * Transform API categories to UI format
 * @param {Array} apiCategories - Categories from API
 * @returns {Array} - Formatted categories for UI
 */
export const transformCategories = (apiCategories) => {
  if (!Array.isArray(apiCategories)) return [];
  
  return apiCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    key: cat.name.toLowerCase().replace(/\s+/g, '-'),
    displayName: formatCategoryName(cat.name),
    description: cat.description,
    idea_count: cat.idea_count || 0,
  }));
};

/**
 * Add special categories (All Ideas, Uncategorized) to category list
 * @param {Array} categories - Array of category objects
 * @param {number} totalIdeas - Total number of ideas for "All Ideas"
 * @returns {Array} - Categories with special items added
 */
export const addSpecialCategories = (categories, totalIdeas = 0) => {
  const result = [
    {
      id: 'all-ideas',
      name: 'all',
      key: 'all-ideas',
      displayName: 'All Ideas',
      idea_count: totalIdeas,
    },
    ...categories,
  ];
  
  return result;
};

const categoryUtils = {
  formatCategoryName,
  formatCategoryKey,
  getCategoryIcon,
  getDefaultCategories,
  transformCategories,
  addSpecialCategories,
};

export default categoryUtils;
