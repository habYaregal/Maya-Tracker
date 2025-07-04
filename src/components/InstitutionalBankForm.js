import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Button,
  Card,
  TextInput,
  Text,
  HelperText,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { saveInstitutionalBank } from '../services/database';
import Animated, { FadeInDown } from 'react-native-reanimated';

const InstitutionalBankForm = ({ navigation, route }) => {
  const { bank: editBank } = route.params || {};
  const [bank, setBank] = useState({
    bankName: editBank?.bankName || '',
    accountType: editBank?.accountType || 'savings',
    balance: editBank?.balance?.toString() || '',
  });
  const [errors, setErrors] = useState({});
  const { colors } = useTheme();

  const handleChange = (field, value) => {
    setBank((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!bank.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!bank.balance || isNaN(bank.balance))
      newErrors.balance = 'Valid balance amount required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const processedBank = {
          ...bank,
          id: editBank ? editBank.id : undefined,
          balance: parseFloat(bank.balance) || 0,
        };
        await saveInstitutionalBank(processedBank);
        navigation.navigate('BankList', { refresh: true });
      } catch (error) {
        console.error('Error saving institutional bank:', error);
        setErrors({ submit: 'Failed to save bank' });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title={editBank ? 'Edit Bank Account' : 'Add Bank Account'}
              titleStyle={[styles.title, { color: colors.text }]}
            />
            <Card.Content>
              {/* Bank Name */}
              <Animated.View entering={FadeInDown.delay(100)}>
                <TextInput
                  label="Bank Name"
                  value={bank.bankName}
                  onChangeText={(text) => handleChange('bankName', text)}
                  error={!!errors.bankName}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                  allowFontScaling={false}
                  mode="outlined"
                />
                <HelperText type="error" visible={!!errors.bankName} style={{ color: colors.error }}>
                  {errors.bankName}
                </HelperText>
              </Animated.View>

              {/* Account Type */}
              <Animated.View entering={FadeInDown.delay(200)}>
                <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
                <SegmentedButtons
                  value={bank.accountType}
                  onValueChange={(value) => handleChange('accountType', value)}
                  buttons={[
                    { value: 'savings', label: 'Savings', icon: 'piggy-bank' },
                    { value: 'checking', label: 'Checking', icon: 'credit-card' },
                    { value: 'business', label: 'Business', icon: 'briefcase' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </Animated.View>

              {/* Balance */}
              <Animated.View entering={FadeInDown.delay(300)}>
                <TextInput
                  label="Current Balance ($)"
                  value={bank.balance}
                  onChangeText={(text) => handleChange('balance', text)}
                  keyboardType="numeric"
                  error={!!errors.balance}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                  allowFontScaling={false}
                  mode="outlined"
                  placeholder="e.g., 5000.00"
                />
                <HelperText type="error" visible={!!errors.balance} style={{ color: colors.error }}>
                  {errors.balance}
                </HelperText>
              </Animated.View>

              {/* Submit Error */}
              {errors.submit && (
                <HelperText type="error" visible={!!errors.submit} style={{ color: colors.error }}>
                  {errors.submit}
                </HelperText>
              )}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.surface }}
          >
            {editBank ? 'Update Bank' : 'Add Bank'}
          </Button>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
});

export default InstitutionalBankForm; 