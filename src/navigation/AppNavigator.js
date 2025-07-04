import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import your screens and components
import TransactionListScreen from '../screens/TransactionListScreen';
import TransactionForm from '../components/TransactionForm';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import LoanListScreen from '../screens/LoanListScreen';
import LoanForm from '../components/LoanForm';
import LoanDetailScreen from '../screens/LoanDetailScreen';
import BankListScreen from '../screens/BankListScreen';
import LocalInstitutionForm from '../components/LocalInstitutionForm';
import InstitutionalBankForm from '../components/InstitutionalBankForm';
import BankTransactionForm from '../components/BankTransactionForm';
import LocalInstitutionDetailScreen from '../screens/LocalInstitutionDetailScreen';
import InstitutionalBankDetailScreen from '../screens/InstitutionalBankDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TransactionStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerBackground: () => (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{ title: 'Transactions' }}
      />
      <Stack.Screen
        name="TransactionForm"
        component={TransactionForm}
        options={{ title: 'New Transaction' }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailScreen}
        options={{ title: 'Transaction Details' }}
      />
    </Stack.Navigator>
  );
};

const LoanStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerBackground: () => (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="LoanList"
        component={LoanListScreen}
        options={{ title: 'Loans' }}
      />
      <Stack.Screen
        name="LoanForm"
        component={LoanForm}
        options={{ title: 'New Loan' }}
      />
      <Stack.Screen
        name="LoanDetails"
        component={LoanDetailScreen}
        options={{ title: 'Loan Details' }}
      />
    </Stack.Navigator>
  );
};

const BankStack = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerBackground: () => (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
      }}
    >
      <Stack.Screen
        name="BankList"
        component={BankListScreen}
        options={{ title: 'Banks' }}
      />
      <Stack.Screen
        name="LocalInstitutionForm"
        component={LocalInstitutionForm}
        options={{ title: 'Local Group' }}
      />
      <Stack.Screen
        name="InstitutionalBankForm"
        component={InstitutionalBankForm}
        options={{ title: 'Bank Account' }}
      />
      <Stack.Screen
        name="LocalInstitutionDetails"
        component={LocalInstitutionDetailScreen}
        options={{ title: 'Group Details' }}
      />
      <Stack.Screen
        name="InstitutionalBankDetails"
        component={InstitutionalBankDetailScreen}
        options={{ title: 'Bank Details' }}
      />
      <Stack.Screen
        name="BankTransactionForm"
        component={BankTransactionForm}
        options={{ title: 'Add Transaction' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Transactions') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Loans') {
              iconName = focused ? 'cash' : 'cash-100';
            } else if (route.name === 'Banks') {
              iconName = focused ? 'bank' : 'bank-outline';
            }

            return (
              <View style={styles.tabIconContainer}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={24}
                  color={color}
                />
                {focused && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
            );
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            elevation: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            borderRadius: 12,
            marginHorizontal: 6,
            marginVertical: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondaryText,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 4,
          },
          tabBarBackground: () => (
            <Surface
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                },
              ]}
              elevation={4}
            >
              <LinearGradient
                colors={[`${colors.surface}E6`, `${colors.surface}FF`]}
                style={StyleSheet.absoluteFill}
              />
            </Surface>
          ),
          headerShown: false,
        })}
      >
        <Tab.Screen name="Transactions" component={TransactionStack} />
        <Tab.Screen name="Loans" component={LoanStack} />
        <Tab.Screen name="Banks" component={BankStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default AppNavigator;