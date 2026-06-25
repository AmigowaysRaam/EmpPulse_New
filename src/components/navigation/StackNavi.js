import { createStackNavigator } from '@react-navigation/stack';
import AllMeetings from '../AllMeetings';
import AssignTaskListScreen from '../AssignTaskListScreen';
import Attendance from '../Attendance';
import AttendanceActivity from '../AttendanceActivity';
import AttendanceGroupScreen from '../AttendanceGroupscreen';
import AttendanceLog from '../AttendanceLog';
import AttendanceLoginScreen from '../AtttendanceLogin';
import ChangeMpin from '../ChangeMpin';
import ChatConvoScreen from '../ChatConvoScreen';
import ChatUserProfileScreen from '../ChatUserProfileScreen';
import CreateMpin from '../CreateMpin';
import CreateTask from '../CreateTask';
import forgetotpVerfication from '../forgetotpVerfication';
import GroupChatInfoScreen from '../GroupChatInfoScreen';
import GroupChatScreen from '../GroupChatScreen';
import LeadDetailtScreen from '../LeadDetailtScreen';
import LeadListScreen from '../LeadListScreen';
import LeaveManagement from '../LeaveManagement';
import Login from '../Login';
import MaintainancePage from '../MaintainancePage';
import MediaSharedScreen from '../MediaSharedScreen';
import MeetingDetailsScreen from '../MeetingDetailsScreen';
import MeetingTimeLine from '../MeetingTimeLine';
import MobileLogin from '../MobileLogin';
import MpinLoginScreen from '../MpinLoginScreen';
import MyTaskListScreen from '../MyTaskListScreen';
import Notification from '../Notification';
import OtpVerfication from '../otpVerfication';
import OurStoreScreen from '../Ourstore';
import PayrollLogScreen from '../PayrollLogScreen';
import PayRollScreen from '../PayRollScreen';
import PrivacyPolicyScreen from '../PrivacyPolicy';
import Remainder from '../Remainder';
import ResetMpin from '../ResetMpin';
import SalesLocationScreen from '../SalesLoc';
import SettingsScreen from '../Settings';
import SplashScreen from '../SplashScreen';
import StarredMessagesScreen from '../StarredMessagesScreen';
import TasKDetailById from '../TasKDetailById';
import TaskDetails from '../TaskDetails';
import TermsScreen from '../Terms';
import TodayMeetingsLIsts from '../TodayMeetingsLIsts';
import UpdateTask from '../UpdateTask';
import BottomTab from './BottomTab';
export default function StackNavi() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName='splash' screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name='splash' component={SplashScreen} />
      <Stack.Screen name='login' component={Login} />
      <Stack.Screen name='home' component={BottomTab} />
      <Stack.Screen name='MobileLogin' component={MobileLogin} />
      <Stack.Screen name='OtpVerfication' component={OtpVerfication} />
      <Stack.Screen name='CreateMpin' component={CreateMpin} />
      <Stack.Screen name='MpinLoginScreen' component={MpinLoginScreen} />
      <Stack.Screen name='MaintainancePage' component={MaintainancePage} />
      <Stack.Screen name='ChangeMpin' component={ChangeMpin} />
      <Stack.Screen name='forgetotpVerfication' component={forgetotpVerfication} />
      <Stack.Screen name='ResetMpin' component={ResetMpin} />
      <Stack.Screen name='MyTaskListScreen' component={MyTaskListScreen} />
      <Stack.Screen name='AssignTaskListScreen' component={AssignTaskListScreen} />
      <Stack.Screen name='CreateTask' component={CreateTask} />
      <Stack.Screen name='Notification' component={Notification} />
      <Stack.Screen name='TasKDetailById' component={TasKDetailById} />
      <Stack.Screen name='OurStoreScreen' component={OurStoreScreen} />
      <Stack.Screen name='TermsScreen' component={TermsScreen} />
      <Stack.Screen name='PrivacyPolicyScreen' component={PrivacyPolicyScreen} />
      <Stack.Screen name='SettingsScreen' component={SettingsScreen} />
      <Stack.Screen name='UpdateTask' component={UpdateTask} />
      <Stack.Screen name='Attendance' component={Attendance} />
      <Stack.Screen name='PayRollScreen' component={PayRollScreen} />
      <Stack.Screen name='AttendanceLog' component={AttendanceLog} />
      <Stack.Screen name='PayrollLogScreen' component={PayrollLogScreen} />
      <Stack.Screen name='Remainder' component={Remainder} />
      <Stack.Screen name='TaskDetails' component={TaskDetails} />
      <Stack.Screen name='AttendanceLoginScreen' component={AttendanceLoginScreen} />
      <Stack.Screen name='AttendanceActivity' component={AttendanceActivity} />
      <Stack.Screen name='LeaveManagement' component={LeaveManagement} />
      <Stack.Screen name='LeadDetailtScreen' component={LeadDetailtScreen} />
      <Stack.Screen name='TodayMeetingsLIsts' component={TodayMeetingsLIsts} />
      <Stack.Screen name='MeetingTimeLine' component={MeetingTimeLine} />
      <Stack.Screen name='MeetingDetailsScreen' component={MeetingDetailsScreen} />
      <Stack.Screen name='AllMeetings' component={AllMeetings} />
      <Stack.Screen name='ChatConvoScreen' component={ChatConvoScreen} />
      <Stack.Screen name='GroupChatScreen' component={GroupChatScreen} />
      <Stack.Screen name='ChatUserProfileScreen' component={ChatUserProfileScreen} />
      <Stack.Screen name='StarredMessagesScreen' component={StarredMessagesScreen} />
      <Stack.Screen name='MediaSharedScreen' component={MediaSharedScreen} />
      <Stack.Screen name='GroupChatInfoScreen' component={GroupChatInfoScreen} />
      <Stack.Screen name='AttendanceGroupScreen' component={AttendanceGroupScreen} />
      <Stack.Screen
        name="LeadListScreen"
        component={LeadListScreen}
      />
      <Stack.Screen
        name="SalesLocationScreen"
        component={SalesLocationScreen}
      />
    </Stack.Navigator>
  );
}