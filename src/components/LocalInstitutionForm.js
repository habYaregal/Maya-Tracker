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
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveLocalInstitution } from '../services/database';
import Animated, { FadeInDown } from 'react-native-reanimated';

const LocalInstitutionForm = ({ navigation, route }) => {
  const { institution: editInstitution } = route.params || {};
  const [institution, setInstitution] = useState({
    groupName: editInstitution?.groupName || '',
    weeklyAmount: editInstitution?.weeklyAmount?.toString() || '',
    type: editInstitution?.type || 'full',
    status: editInstitution?.status || 'pending',
    weekNumber: editInstitution?.weekNumber?.toString() || '1',
    date: editInstitution?.date || new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const handleChange = (field, value) => {
    setInstitution((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!institution.groupName.trim()) newErrors.groupName = 'Group name is required';
    if (!institution.weeklyAmount || isNaN(institution.weeklyAmount) || parseFloat(institution.weeklyAmount) <= 0)
      newErrors.weeklyAmount = 'Valid positive weekly amount required';
    if (!institution.weekNumber || isNaN(institution.weekNumber) || parseInt(institution.weekNumber) <= 0)
      newErrors.weekNumber = 'Valid positive week number required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const processedInstitution = {
          ...institution,
          id: editInstitution ? editInstitution.id : undefined,
          weeklyAmount: parseFloat(institution.weeklyAmount) || 0,
          weekNumber: parseInt(institution.weekNumber) || 1,
        };
        await saveLocalInstitution(processedInstitution);
        navigation.navigate('BankList', { refresh: true });
      } catch (error) {
        console.error('Error saving local institution:', error);
        setErrors({ submit: 'Failed to save local institution' });
      }
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) handleChange('date', selectedDate.toISOString().split('T')[0]);
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
              title={editInstitution ? 'Edit Local Group' : 'Add Local Group'}
              titleStyle={[styles.title, { color: colors.text }]}
            />
            <Card.Content>
              {/* Group Name */}
              <Animated.View entering={FadeInDown.delay(100)}>
                <TextInput
                  label="Group Name"
                  value={institution.groupName}
                  onChangeText={(text) => handleChange('groupName', text)}
                  error={!!errors.groupName}
                  style={[styles.input, { backgroundColor: colors.background }]}
                  theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                  allowFontScaling={false}
                  mode="outlined"
                />
                <HelperText type="error" visible={!!errors.groupName} style={{ color: colors.error }}>
                  {errors.groupName}
                </HelperText>
              </Animated.View>

              {/* Weekly Amount and Week Number */}
              <View style={styles.row}>
                <Animated.View entering={FadeInDown.delay(200)} style={{ flex: 1 }}>
                  <TextInput
                    label="Weekly Amount ($)"
                    value={institution.weeklyAmount}
                    onChangeText={(text) => handleChange('weeklyAmount', text)}
                    keyboardType="numeric"
                    error={!!errors.weeklyAmount}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 100.00"
                  />
                  <HelperText type="error" visible={!!errors.weeklyAmount} style={{ color: colors.error }}>
                    {errors.weeklyAmount}
                  </HelperText>
                </Animated.View>
                <Animated.View entering={FadeInDown.delay(300)} style={{ flex: 1 }}>
                  <TextInput
                    label="Week Number"
                    value={institution.weekNumber}
                    onChangeText={(text) => handleChange('weekNumber', text)}
                    keyboardType="numeric"
                    error={!!errors.weekNumber}
                    style={[styles.input, { backgroundColor: colors.background }]}
                    theme={{ colors: { primary: colors.primary, error: colors.error, text: colors.text } }}
                    allowFontScaling={false}
                    mode="outlined"
                    placeholder="e.g., 1"
                  />
                  <HelperText type="error" visible={!!errors.weekNumber} style={{ color: colors.error }}>
                    {errors.weekNumber}
                  </HelperText>
                </Animated.View>
              </View>

              {/* Type Selection */}
              <Animated.View entering={FadeInDown.delay(400)}>
                <Text style={[styles.label, { color: colors.text }]}>Contribution Type</Text>
                <SegmentedButtons
                  value={institution.type}
                  onValueChange={(value) => handleChange('type', value)}
                  buttons={[
                    { value: 'full', label: 'Full', icon: 'circle' },
                    { value: 'half', label: 'Half', icon: 'circle-half-full' },
                    { value: 'quarter', label: 'Quarter', icon: 'circle-outline' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </Animated.View>

              {/* Status Selection */}
              <Animated.View entering={FadeInDown.delay(500)}>
                <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                <SegmentedButtons
                  value={institution.status}
                  onValueChange={(value) => handleChange('status', value)}
                  buttons={[
                    { value: 'pending', label: 'Pending', icon: 'clock-outline' },
                    { value: 'paid', label: 'Paid', icon: 'check-circle' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </Animated.View>

              {/* Date Selection */}
              <Animated.View entering={FadeInDown.delay(600)}>
                <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.dateButton, { borderColor: colors.primary }]}
                  labelStyle={{ color: colors.text }}
                >
                  {institution.date}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(institution.date)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
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
        <Animated.View entering={FadeInDown.delay(700)} style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.surface }}
          >
            {editInstitution ? 'Update Group' : 'Add Group'}
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  dateButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
});

export default LocalInstitutionForm; 