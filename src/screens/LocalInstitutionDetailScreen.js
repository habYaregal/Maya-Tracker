import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
  Button,
  useTheme,
  Divider,
  List,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  fetchLocalInstitutions,
  addLocalInstitutionPayment,
  deleteLocalInstitution
} from '../services/database';
import { ThemeContext } from '../utils/ThemeContext';

const LocalInstitutionDetailScreen = ({ navigation, route }) => {
  const { institution: initialInstitution } = route.params;
  const [institution, setInstitution] = useState(initialInstitution);
  const { colors } = useTheme();
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const loadInstitution = async () => {
      const institutions = await fetchLocalInstitutions();
      const updatedInstitution = institutions.find(i => i.id === initialInstitution.id);
      if (updatedInstitution) {
        setInstitution(updatedInstitution);
      }
    };
    loadInstitution();
  }, [initialInstitution.id]);

  const handleEdit = () => {
    navigation.navigate('LocalInstitutionForm', { institution });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${institution.groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLocalInstitution(institution.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddPayment = () => {
    navigation.navigate('LocalInstitutionPaymentForm', { institution });
  };

  const renderStatusChip = (status) => {
    const statusConfig = {
      paid: { color: colors.success, icon: 'check-circle' },
      pending: { color: colors.accent, icon: 'clock-outline' },
      default: { color: colors.primary, icon: 'help-circle' },
    };

    const { color, icon } = statusConfig[status] || statusConfig.default;

    return (
      <Chip
        icon={({ size }) => (
          <MaterialCommunityIcons
            name={icon}
            size={14}
            color={colors.surface}
          />
        )}
        style={[
          styles.chip,
          {
            backgroundColor: color,
            borderColor: colors.primary,
            borderWidth: 0.5,
          },
        ]}
        textStyle={{ color: colors.surface, fontSize: 12, fontWeight: '600' }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  const weeklyAmount = parseFloat(institution.weeklyAmount) || 0;
  const weekNumber = parseInt(institution.weekNumber) || 1;
  const typeMultiplier = {
    full: 1,
    half: 0.5,
    quarter: 0.25
  }[institution.type] || 1;
  
  const expectedAmount = weeklyAmount * weekNumber * typeMultiplier;
  const totalPayments = institution.payments.reduce(
    (sum, p) => sum + parseFloat(p.amount || 0),
    0
  );
  const remainingAmount = expectedAmount - totalPayments;
  const progressPercentage = (totalPayments / expectedAmount) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={32}
                  color={colors.primary}
                />
                <View style={styles.headerText}>
                  <Text style={[styles.groupName, { color: colors.text }]}>
                    {institution.groupName}
                  </Text>
                  <Text style={[styles.groupType, { color: colors.secondaryText }]}>
                    {institution.type.charAt(0).toUpperCase() + institution.type.slice(1)} Contribution
                  </Text>
                </View>
                {renderStatusChip(institution.status)}
              </View>

              <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />

              {/* Financial Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                      Weekly Amount
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      ${weeklyAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                      Week Number
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>
                      {weekNumber}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
                      Expected Total
                    </Text>
                    <Text style={[styles.summaryValue, { color: colors.primary }]}>
                      ${expectedAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(progressPercentage, 100)}%`,
                          backgroundColor: progressPercentage >= 100 ? colors.success : colors.accent,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.secondaryText }]}>
                    {progressPercentage.toFixed(1)}% Complete
                  </Text>
                </View>

                <View style={styles.amountRow}>
                  <View style={styles.amountItem}>
                    <Text style={[styles.amountLabel, { color: colors.secondaryText }]}>
                      Paid
                    </Text>
                    <Text style={[styles.amountValue, { color: colors.success }]}>
                      ${totalPayments.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={[styles.amountLabel, { color: colors.secondaryText }]}>
                      Remaining
                    </Text>
                    <Text style={[styles.amountValue, { color: remainingAmount > 0 ? colors.accent : colors.success }]}>
                      ${remainingAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Details Card */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title="Group Details"
              titleStyle={[styles.cardTitle, { color: colors.text }]}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="information"
                  size={24}
                  color={colors.primary}
                />
              )}
            />
            <Card.Content>
              <List.Item
                title="Start Date"
                description={new Date(institution.date).toLocaleDateString()}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name="calendar"
                    size={20}
                    color={colors.secondary}
                  />
                )}
                titleStyle={[styles.listTitle, { color: colors.text }]}
                descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
              />
              <List.Item
                title="Contribution Type"
                description={institution.type.charAt(0).toUpperCase() + institution.type.slice(1)}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name="circle"
                    size={20}
                    color={colors.secondary}
                  />
                )}
                titleStyle={[styles.listTitle, { color: colors.text }]}
                descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
              />
              <List.Item
                title="Status"
                description={institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name={institution.status === 'paid' ? 'check-circle' : 'clock-outline'}
                    size={20}
                    color={institution.status === 'paid' ? colors.success : colors.accent}
                  />
                )}
                titleStyle={[styles.listTitle, { color: colors.text }]}
                descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
              />
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Payments Card */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)}>
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Title
              title={`Payment History (${institution.payments.length})`}
              titleStyle={[styles.cardTitle, { color: colors.text }]}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="cash-multiple"
                  size={24}
                  color={colors.primary}
                />
              )}
            />
            <Card.Content>
              {institution.payments.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="cash-remove"
                    size={48}
                    color={colors.secondaryText}
                  />
                  <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                    No payments recorded yet
                  </Text>
                </View>
              ) : (
                institution.payments.map((payment, index) => (
                  <List.Item
                    key={payment.id}
                    title={`Payment ${index + 1}`}
                    description={`${new Date(payment.date).toLocaleDateString()} • $${parseFloat(payment.amount).toFixed(2)}`}
                    left={(props) => (
                      <MaterialCommunityIcons
                        {...props}
                        name="cash"
                        size={20}
                        color={colors.success}
                      />
                    )}
                    titleStyle={[styles.listTitle, { color: colors.text }]}
                    descriptionStyle={[styles.listDescription, { color: colors.secondaryText }]}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleAddPayment}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.surface }}
            icon="plus"
          >
            Add Payment
          </Button>
        </Animated.View>
      </ScrollView>

      {/* FAB for quick actions */}
      <FAB
        icon="dots-horizontal"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {
          Alert.alert(
            'Actions',
            'Choose an action',
            [
              { text: 'Edit', onPress: handleEdit },
              { text: 'Delete', onPress: handleDelete, style: 'destructive' },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupType: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  listDescription: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  chip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LocalInstitutionDetailScreen; 