import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const LoanDetailScreen = ({ route }) => {
  const { loan } = route.params || {};
  const { colors } = useTheme();

  if (!loan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>No loan data available</Text>
      </View>
    );
  }

  const paymentsTotal = loan.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const balance = parseFloat(loan.amount) - paymentsTotal;

  const renderStatusChip = () => {
    const statusConfig = {
      active: { color: colors.accent, icon: 'progress-clock' },
      paid: { color: colors.success, icon: 'check' },
      default: { color: colors.primary, icon: 'help-circle' },
    };

    const { color, icon } = statusConfig[loan.status] || statusConfig.default;

    return (
      <Chip
        icon={({ size }) => <MaterialCommunityIcons name={icon} size={14} color={colors.surface} />}
        style={[styles.chip, { backgroundColor: color, borderColor: colors.primary, borderWidth: 0.5 }]}
        textStyle={{ color: colors.surface, fontSize: 12, fontWeight: '600' }}
      >
        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
      </Chip>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View entering={FadeInDown.duration(300)}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>{loan.partyName}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
            {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)} • ${parseFloat(loan.amount).toFixed(2)}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100)}>
        <Card style={[styles.card, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="bank" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Type</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="account" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                {renderStatusChip()}
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Date</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {new Date(loan.date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="cash" size={20} color={colors.secondary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Initial Amount</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  ${parseFloat(loan.amount).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={balance > 0 ? 'cash-minus' : 'cash-check'}
                  size={20}
                  color={balance > 0 ? colors.accent : colors.success}
                />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {loan.type === 'given' ? 'Amount Owed' : 'Amount to Pay'}
                </Text>
                <Text
                  style={[
                    styles.value,
                    { color: balance > 0 ? colors.accent : colors.success },
                  ]}
                >
                  ${Math.abs(balance).toFixed(2)}
                </Text>
              </View>
            </View>

            {loan.payments.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment History</Text>
                {loan.payments.map((payment, index) => (
                  <View key={payment.id} style={styles.paymentRow}>
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons name="cash-plus" size={20} color={colors.secondary} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>
                        {loan.type === 'given' ? 'Received' : 'Paid'} on {new Date(payment.date).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.value, { color: colors.text }]}>
                        ${parseFloat(payment.amount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    </ScrollView>
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
  headerGradient: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(75, 134, 180, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  chip: {
    borderRadius: 12,
    height: 26,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoanDetailScreen;