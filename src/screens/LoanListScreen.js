import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  IconButton,
  FAB,
  Searchbar,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { fetchLoans, deleteLoan } from '../services/database';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../utils/ThemeContext';

const LoanListScreen = ({ navigation }) => {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const loadLoans = async () => {
      const fetchedLoans = await fetchLoans();
      setLoans(fetchedLoans);
    };
    loadLoans();
    const unsubscribe = navigation.addListener('focus', loadLoans);
    return unsubscribe;
  }, [navigation]);

  const handleEdit = (loan) => {
    navigation.navigate('LoanForm', { loan });
  };

  const handleDelete = async (id) => {
    await deleteLoan(id);
    setLoans(loans.filter((l) => l.id !== id));
  };

  const handleViewDetails = (loan) => {
    navigation.navigate('LoanDetails', { loan });
  };

  const renderStatusChip = (status) => {
    const statusConfig = {
      active: { color: colors.accent, icon: 'progress-clock' },
      paid: { color: colors.success, icon: 'check' },
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

  const renderItem = ({ item, index }) => {
    const paymentsTotal = item.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const balance = parseFloat(item.amount) - paymentsTotal;

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).duration(300)}
        key={item.id}>
        <TouchableOpacity
          onPress={() => handleViewDetails(item)}
          activeOpacity={0.9}>
          <Card
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderLeftWidth: 4,
                borderLeftColor:
                  item.status === 'paid' ? colors.success : colors.accent,
              },
            ]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.headerRow}>
                <MaterialCommunityIcons
                  name="bank"
                  size={20}
                  color={colors.secondary}
                  style={styles.icon}
                />
                <View style={styles.titleContainer}>
                  <Text
                    style={[styles.partyName, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.partyName}
                  </Text>
                  <Text
                    style={[styles.details, { color: colors.secondaryText }]}>
                    {item.type === 'given' ? 'Given' : 'Taken'} • $
                    {parseFloat(item.amount).toFixed(2)}
                  </Text>
                </View>
                {renderStatusChip(item.status)}
              </View>

              <View style={styles.footerRow}>
                <View style={styles.dateContainer}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={14}
                    color={colors.secondaryText}
                  />
                  <Text
                    style={[styles.dateText, { color: colors.secondaryText }]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.balanceContainer,
                    {
                      backgroundColor:
                        balance > 0
                          ? `${colors.accent}20`
                          : `${colors.success}20`,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.balanceText,
                      { color: balance > 0 ? colors.accent : colors.success },
                    ]}>
                    {balance > 0 ? 'Owed' : 'Settled'} $
                    {Math.abs(balance).toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <IconButton
                icon="pencil"
                size={18}
                onPress={() => handleEdit(item)}
                iconColor={colors.secondary}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={18}
                onPress={() => handleDelete(item.id)}
                iconColor={colors.error}
                style={styles.actionButton}
              />
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const filteredLoans = loans.filter((loan) =>
    loan.partyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <Searchbar
          placeholder="Search loans"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.search, { backgroundColor: colors.surface }]}
          inputStyle={{
            color: colors.text,
            fontSize: 16,
            allowFontScaling: false,
          }}
          iconColor={colors.secondary}
          placeholderTextColor={colors.secondaryText}
          allowFontScaling={false}
          elevation={2}
        />
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.toggleButton, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons
            name={isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={24}
            color={colors.accent}
          />
        </TouchableOpacity>
      </Animated.View>
      <FlatList
        data={filteredLoans}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 80, paddingHorizontal: 16 },
        ]}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('LoanForm')}
        customSize={60}
        color={colors.text}
        theme={{ colors: { accent: 'transparent' } }}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </FAB>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  search: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 4,
    elevation: 2,
  },
  card: {
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    marginLeft: 4,
  },
  balanceContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chip: {
    borderRadius: 12,
    height: 26,
    paddingHorizontal: 6,
  },
  actions: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  actionButton: {
    margin: 0,
  },
  list: {
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
});

export default LoanListScreen;
