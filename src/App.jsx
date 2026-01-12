import { useState, useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import ErrorBoundary from "./components/ErrorBoundary";
import appStore from "./redux/appStore";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/userSlice";
import APIService from "./services/api";
import Loading from "./components/Loading";
import Home from "./pages/student/Home";
import Courses from "./pages/student/Courses";
import Contact from "./pages/student/Contact";
import Signin from "./pages/authentication/Signin";
import Signup from "./pages/authentication/Signup";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import Profile from "./pages/student/Profile";
import ProfileSettings from "./pages/student/ProfileSettings";
import Body from "./components/Body";
import Lectures from "./pages/student/Lectures";
import Resume from "./pages/student/Resume";
import Interview from "./pages/student/Interview";
import Editor from "./pages/student/Editor";
import Awards from "./pages/student/Awards";
import AllCourses from "./pages/admin/AllCourses";
import AllUsers from "./pages/admin/AllUsers";
import CreateCourse from "./pages/admin/CreateCourse";
import CreateRoadmap from "./pages/admin/CreateRoadmap";
import UpdateCourse from "./pages/admin/UpdateCourse";
import AllRoadMaps from "./pages/admin/AllRoadMaps";
import UpdateRoadMap from "./pages/admin/UpdateRoadMap";
import CreateRecordings from "./pages/admin/CreateRecordings";
import AllRecordings from "./pages/admin/AllRecordings";
import UpdateRecordings from "./pages/admin/UpdateRecordings";
import UpdateUser from "./pages/admin/UpdateUser";
import UpdatePc from "./pages/admin/UpdatePc";
import UpdateIc from "./pages/admin/UpdateIc";
import BuyNow from "./pages/student/BuyNow";
import Recordings from "./pages/student/Recordings";
import UpdateCc from "./pages/admin/UpdateCc";
import UpdateInvoice from "./pages/admin/UpdateInvoice";
import CreateLogo from "./pages/admin/CreateLogo";
import AllCompanyLogos from "./pages/admin/AllCompanyLogos";
import UpdateCompany from "./pages/admin/UpdateCompany";
import CreateVideo from "./pages/admin/CreateVideo";
import AllVideos from "./pages/admin/AllVideos";
import UpdateVideos from "./pages/admin/UpdateVideos";
import About from "./pages/student/About";
import Products from "./pages/student/Products";
import Carrers from "./pages/student/Carrers";
import Terms from "./pages/student/Terms";
import CreatePrivacy from "./pages/admin/CreatePrivacy";
import AllPrivacy from "./pages/admin/AllPrivacy";
import UpdatePrivacy from "./pages/admin/UpdatePrivacy";
import FreeClass from "./pages/student/FreeClass";
import Thanks from "./pages/student/Thanks";
import AllRegisters from "./pages/admin/AllRegisters";
import AllFeedbacks from "./pages/admin/AllFeedbacks";
import CreateBootcamp from "./pages/admin/CreateBootcamp";
import AllBootcamps from "./pages/admin/AllBootcamps";
import UpdateBootcamp from "./pages/admin/UpdateBootcamp";
import CreateRoadMapTopics from "./pages/admin/CreateRoadMapTopics";
import UpdateRoadMapTopics from "./pages/admin/UpdateRoadMapTopics";
import AllRoadMapTopics from "./pages/admin/AllRoadMapTopics";
import CreateJob from "./pages/admin/CreateJob";
import AllJobs from "./pages/admin/AllJobs";
import UpdateJob from "./pages/admin/UpdateJob";
import CreateData from "./pages/admin/CreateData";
import AllData from "./pages/admin/AllData";
import UpdateData from "./pages/admin/UpdateData";
import CreateTest from "./pages/admin/CreateTest";
import AllTests from "./pages/admin/AllTests";
import UpdateTest from "./pages/admin/UpdateTest";
import NotFoundPage from "./pages/NotFoundPage";
import ResetPassword from "./pages/student/ResetPassword";
import ResetPasswordRequest from "./pages/student/ResetPasswordRequest";
import CreateInterviewQuestions from "./pages/admin/CreateInterviewQuestions";
import AllInterviewQuestions from "./pages/admin/AllInterviewQuestions";
import UpdateInterviewQuestions from "./pages/admin/UpdateInterviewQuestions";
import AISettings from "./pages/student/AISettings";
import AIInterview from "./pages/student/AIInterview";
import AIResume from "./pages/student/AIResume";
import AIJobSearch from "./pages/student/AIJobSearch";

// Protected Route Wrapper
function ProtectedRoute({ element: Element, allowedRole }) {
  const { user } = useSelector((state) => state.user);
  const role = user?.role;

  if (!user) {
    // Redirect to signin if no user is logged in
    return null;
  }

  if (role !== allowedRole) {
    // Redirect to home if role doesn't match
    return <Navigate to="/" replace />;
  }

  return <Element />;
}

// Separate component for routes
function AppRoutes(props) {
  const dispatch = useDispatch();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await APIService.profile.getMe();
          dispatch(setUser(response.data));
        } catch (error) {
          // Session verification failed, clear token
          localStorage.removeItem('token');
        }
      }
      setIsAuthChecking(false);
    };

    verifySession();
  }, [dispatch]);

  if (isAuthChecking) {
    return <Loading message="Verifying session..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<Body {...props} />}>
        <Route index element={<Home {...props} />} />
        <Route path="/courses" element={<Courses {...props.bannerData} />} />
        <Route path="/contact" element={<Contact {...props.bannerData} />} />
        <Route path="/about-us" element={<About {...props.bannerData} />} />
        <Route path="/carrers" element={<Carrers {...props.bannerData} />} />
        <Route path="/products" element={<Products {...props.bannerData} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/buy-now/:id/:courseId" element={<BuyNow />} />
        <Route path="/privacy-policy" element={<Terms />} />
        <Route path="/free-class/:id" element={<FreeClass {...props.bannerData} />} />
        <Route path="/register-successful" element={<Thanks />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequest />} />

        {/* Student Dashboard */}
        <Route
          path="/student-dashboard/profile"
          element={<ProtectedRoute element={StudentDashboard} allowedRole="student" />}
        >
          <Route index element={<Profile />} />
          <Route path="lectures" element={<Lectures />} />
          <Route path="awards" element={<Awards />} />
          <Route path="resume-templates" element={<Resume />} />
          <Route path="interview-preparation" element={<Interview />} />
          <Route path="editor" element={<Editor />} />
          <Route path="settings" element={<ProfileSettings />} />
          <Route path="recordings/:id" element={<Recordings />} />
          <Route path="ai-settings" element={<AISettings />} />
          <Route path="ai-interview" element={<AIInterview />} />
          <Route path="ai-resume" element={<AIResume />} />
          <Route path="ai-job-search" element={<AIJobSearch />} />
        </Route>

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute element={AdminDashboard} allowedRole="admin" />}
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="profile/all-users" element={<AllUsers />} />
          <Route path="profile/update-user/:id" element={<UpdateUser />} />
          <Route path="profile/update-pc/:id" element={<UpdatePc />} />
          <Route path="profile/update-ic/:id" element={<UpdateIc />} />
          <Route path="profile/update-cc/:id" element={<UpdateCc />} />
          <Route path="profile/update-invoice/:id" element={<UpdateInvoice />} />
          <Route path="profile/all-courses" element={<AllCourses />} />
          <Route path="profile/all-courses/:id" element={<UpdateCourse />} />
          <Route path="profile/all-roadmaps" element={<AllRoadMaps />} />
          <Route path="profile/create-course" element={<CreateCourse />} />
          <Route path="profile/create-road-map" element={<CreateRoadmap />} />
          <Route path="profile/update-road-map/:id" element={<UpdateRoadMap />} />
          <Route path="profile/create-recordings" element={<CreateRecordings />} />
          <Route path="profile/all-recordings" element={<AllRecordings />} />
          <Route path="profile/update-recordings/:id" element={<UpdateRecordings />} />
          <Route path="profile/create-logo" element={<CreateLogo />} />
          <Route path="profile/all-company-logos" element={<AllCompanyLogos />} />
          <Route path="profile/update-company/:id" element={<UpdateCompany />} />
          <Route path="profile/create-video" element={<CreateVideo />} />
          <Route path="profile/all-videos" element={<AllVideos />} />
          <Route path="profile/update-video/:id" element={<UpdateVideos />} />
          <Route path="profile/create-privacy" element={<CreatePrivacy />} />
          <Route path="profile/all-privacy" element={<AllPrivacy />} />
          <Route path="profile/update-privacy/:id" element={<UpdatePrivacy />} />
          <Route path="profile/all-registers" element={<AllRegisters />} />
          <Route path="profile/all-feedbacks" element={<AllFeedbacks />} />
          <Route path="profile/create-bootcamp" element={<CreateBootcamp />} />
          <Route path="profile/all-bootcamps" element={<AllBootcamps />} />
          <Route path="profile/update-bootcamp/:id" element={<UpdateBootcamp />} />
          <Route path="profile/create-road-map-topics" element={<CreateRoadMapTopics />} />
          <Route path="profile/all-road-map-topics" element={<AllRoadMapTopics />} />
          <Route path="profile/update-road-map-topics/:id" element={<UpdateRoadMapTopics />} />
          <Route path="profile/create-job" element={<CreateJob />} />
          <Route path="profile/all-jobs" element={<AllJobs />} />
          <Route path="profile/update-job/:id" element={<UpdateJob />} />
          <Route path="profile/create-data" element={<CreateData />} />
          <Route path="profile/all-create-data" element={<AllData />} />
          <Route path="profile/update-create-data/:id" element={<UpdateData />} />
          <Route path="profile/create-test" element={<CreateTest />} />
          <Route path="profile/all-tests" element={<AllTests />} />
          <Route path="profile/update-test/:id" element={<UpdateTest />} />
          <Route path="profile/create-interview" element={<CreateInterviewQuestions />} />
          <Route path="profile/all-interview" element={<AllInterviewQuestions />} />
          <Route path="profile/update-interview/:id" element={<UpdateInterviewQuestions />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

function App(props) {

  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <AppRoutes {...props} />
      </BrowserRouter>
    </Provider>
  );
}

export default App;