import React from 'react';
import { Text, TextProps } from 'react-native';

/**
 * SafeText component that prevents React Native bridge errors
 * by sanitizing props and children before passing to native Text component
 */
export const SafeText: React.FC<TextProps> = ({ children, style, ...props }) => {
  // Sanitize children to prevent NaN/undefined/null values
  const safeChildren = React.useMemo(() => {
    if (children == null) return '';
    if (typeof children === 'string') return children;
    if (typeof children === 'number') {
      return isNaN(children) || !isFinite(children) ? '0' : children.toString();
    }
    if (Array.isArray(children)) {
      return children.map(child => 
        child == null ? '' : 
        typeof child === 'number' && (isNaN(child) || !isFinite(child)) ? '0' : 
        String(child)
      ).join('');
    }
    return String(children);
  }, [children]);

  // Sanitize style props to prevent NaN values
  const safeStyle = React.useMemo(() => {
    if (!style) return style;
    if (Array.isArray(style)) {
      return style.map(s => sanitizeStyleObject(s));
    }
    return sanitizeStyleObject(style);
  }, [style]);

  // Clean accessibility props that can cause bridge errors
  const safeProps = React.useMemo(() => {
    const cleaned = { ...props };
    
    // Remove problematic accessibility props if they have invalid values
    if (cleaned.accessibilityState && typeof cleaned.accessibilityState === 'object') {
      Object.keys(cleaned.accessibilityState).forEach(key => {
        const value = cleaned.accessibilityState![key as keyof typeof cleaned.accessibilityState];
        if (value === null || value === undefined) {
          delete cleaned.accessibilityState![key as keyof typeof cleaned.accessibilityState];
        }
      });
    }

    return cleaned;
  }, [props]);

  return (
    <Text {...safeProps} style={safeStyle}>
      {safeChildren}
    </Text>
  );
};

// Helper function to sanitize style objects
function sanitizeStyleObject(styleObj: any): any {
  if (!styleObj || typeof styleObj !== 'object') return styleObj;
  
  const sanitized = { ...styleObj };
  
  // List of numeric style properties that commonly cause bridge errors
  const numericProps = [
    'fontSize', 'lineHeight', 'letterSpacing', 'width', 'height', 
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderWidth', 'borderRadius', 'top', 'right', 'bottom', 'left',
    'opacity', 'elevation', 'zIndex'
  ];
  
  numericProps.forEach(prop => {
    if (prop in sanitized) {
      const value = sanitized[prop];
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        delete sanitized[prop]; // Remove invalid numeric values
      }
    }
  });
  
  return sanitized;
}

export default SafeText;