import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from '../config/appConfig';
import { HIGColors, HIGConstants } from '../styles/common';

/**
 * Legal Screen
 * Shows links to Privacy Policy, Terms of Service, and Contact information
 */
const LegalScreen: React.FC = () => {
  const { t } = useTranslation();

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const sendEmail = async (email: string) => {
    const url = `mailto:${email}`;
    await openUrl(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Documents</Text>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => openUrl(APP_CONFIG.privacyPolicyUrl)}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Text style={styles.linkSubtext}>{APP_CONFIG.privacyPolicyUrl}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => openUrl(APP_CONFIG.termsOfServiceUrl)}
        >
          <Text style={styles.linkText}>Terms of Service</Text>
          <Text style={styles.linkSubtext}>{APP_CONFIG.termsOfServiceUrl}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => sendEmail(APP_CONFIG.contact.email)}
        >
          <Text style={styles.linkText}>General Inquiries</Text>
          <Text style={styles.linkSubtext}>{APP_CONFIG.contact.email}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => sendEmail(APP_CONFIG.contact.privacyEmail)}
        >
          <Text style={styles.linkText}>Privacy Concerns</Text>
          <Text style={styles.linkSubtext}>{APP_CONFIG.contact.privacyEmail}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => sendEmail(APP_CONFIG.contact.supportEmail)}
        >
          <Text style={styles.linkText}>Technical Support</Text>
          <Text style={styles.linkSubtext}>{APP_CONFIG.contact.supportEmail}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About {APP_CONFIG.appName}</Text>
        <Text style={styles.aboutText}>
          {APP_CONFIG.brandName} - {APP_CONFIG.slogan}
        </Text>
        <Text style={styles.aboutText}>
          Website: {APP_CONFIG.websiteUrl}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 {APP_CONFIG.brandName}. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HIGColors.systemBackground,
  },
  section: {
    padding: HIGConstants.SPACING_LG,
    borderBottomWidth: 1,
    borderBottomColor: HIGColors.systemGray4,
  },
  sectionTitle: {
    fontSize: HIGConstants.FONT_SIZE_H3,
    fontWeight: '600',
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_MD,
  },
  linkButton: {
    paddingVertical: HIGConstants.SPACING_MD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HIGColors.systemGray5,
  },
  linkText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.systemBlue,
    fontWeight: '500',
  },
  linkSubtext: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.secondaryLabel,
    marginTop: 2,
  },
  aboutText: {
    fontSize: HIGConstants.FONT_SIZE_BODY,
    color: HIGColors.label,
    marginBottom: HIGConstants.SPACING_SM,
  },
  footer: {
    padding: HIGConstants.SPACING_LG,
    alignItems: 'center',
  },
  footerText: {
    fontSize: HIGConstants.FONT_SIZE_CAPTION,
    color: HIGColors.tertiaryLabel,
  },
});

export default LegalScreen;