import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { BACKEND_URL, RAZORPAY_KEY } from "../../../config/constant";
import APIService from "../../services/api";
import { setUser } from "../../redux/userSlice";

function BuyNow() {
  const { id, courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [courseData, setCourseData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [isPaymentSectionVisible, setIsPaymentSectionVisible] = useState(false);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { user } = useSelector((state) => state.user || {});
  const { _id, name, email } = user || {};

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setProgress(100);
  };

  const dismissAlert = () => {
    setAlert(null);
    setProgress(100);
  };

  useEffect(() => {
    if (alert) {
      const duration = 3000;
      const interval = 50;
      const decrement = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            dismissAlert();
            clearInterval(timer);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [alert]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => showAlert("Failed to load Razorpay script.", "error");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch roadmap and course data
  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-roadmap/${id}`, {
          withCredentials: true,
        });
        setRoadmapData(response.data);
      } catch (error) {
        console.error("Roadmap fetch error:", error);
        showAlert(
          error.response?.data?.message || "Failed to fetch course roadmap.",
          "error"
        );
      }
    };

    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/show-course/${courseId}`, {
          withCredentials: true,
        });
        const data = {
          ...response.data,
          offerPrice: response.data.price * 0.3, // 70% discount
        };
        setCourseData(data);
      } catch (error) {
        showAlert(
          error.response?.data?.message || "Failed to fetch course details.",
          "error"
        );
      }
    };

    fetchRoadmapData();
    fetchCourseData();
  }, [id, courseId]);

  // Handle scroll for mobile "Buy Now" button visibility
  useEffect(() => {
    const handleScroll = () => {
      const paymentSection = document.getElementById("payment-section");
      if (paymentSection) {
        const rect = paymentSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          setIsPaymentSectionVisible(true);
        } else {
          setIsPaymentSectionVisible(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // Validate coupon code
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponMessage("");

    try {
      const response = await APIService.courses.validateCoupon(courseId, couponCode);

      if (response.data.valid) {
        setCouponValid(true);
        setCouponMessage(response.data.message || "Coupon is valid! Course is FREE");
        showAlert("Coupon applied successfully! Course is free.", "success");
      } else {
        setCouponValid(false);
        setCouponMessage(response.data.message || "Invalid coupon code");
      }
    } catch (error) {
      setCouponValid(false);
      setCouponMessage(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Handle free enrollment with valid coupon
  const handleFreeEnrollment = async () => {
    if (!user || !_id) {
      showAlert("Please sign in to enroll.", "error");
      navigate("/signup");
      return;
    }

    try {
      setPaymentLoading(true);

      const courseToAdd = {
        courseId,
        courseName: courseData?.courseName,
        amount: "free",  // Changed to "free" instead of 0
        purchaseDate: new Date().toISOString(),
        recordingAccess: true,
        recordingId: courseData?.recordingId,  // Add recording ID
        paymentId: couponCode  // Use coupon code as payment ID for tracking
      };

      const response = await APIService.payment.addCourse(courseToAdd);

      if (response.data) {
        // Refresh user data
        const userResponse = await APIService.profile.getMe();
        dispatch(setUser(userResponse.data));

        // Show celebration modal
        setShowSuccessModal(true);

        // Start countdown from 1 to 10
        let count = 1;
        setCountdown(1);

        const countInterval = setInterval(() => {
          count++;
          setCountdown(count);

          if (count >= 10) {
            clearInterval(countInterval);
            // Redirect after countdown completes
            setTimeout(() => {
              navigate("/student-dashboard/profile/lectures");
            }, 500);
          }
        }, 1000); // 1 second interval
      }
    } catch (error) {
      showAlert(error.response?.data?.error || "Enrollment failed", "error");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePayment = () => {
    if (!user || !_id || !name || !email) {
      showAlert("Please sign in to proceed with payment.", "error");
      navigate("/signup");
      return;
    }

    if (!courseData) {
      showAlert("Course details not loaded. Please try again later.", "error");
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      showAlert("Payment gateway not loaded. Please try again.", "error");
      return;
    }

    const { courseName = "Unknown Course", price = 0, offerPrice = price, imageUrl = "", recordingId = "" } = courseData;
    const finalPrice = Math.floor(offerPrice) || Math.floor(price);

    const options = {
      key: RAZORPAY_KEY,
      amount: finalPrice * 100, // Amount in paise
      currency: "INR",
      name: "World's AI Bot",
      description: courseName,
      image: imageUrl,
      handler: async function (response) {
        const paymentData = {
          transactionId: response.razorpay_payment_id,
          amount: finalPrice,
          courseName,
          recordingsId: recordingId,
          courseId: courseId,
          purchaseDate: new Date().toISOString()
        };

        try {
          setPaymentLoading(true);
          // Use APIService for proper JWT authentication
          const response = await APIService.payment.addCourse(paymentData);

          // Update Redux with new user data
          if (response.data?.user) {
            dispatch(setUser(response.data.user));
          }

          showAlert(`Payment successful! Redirecting...`, "success");

          // Redirect to lectures page after 2 seconds
          setTimeout(() => {
            navigate(`/student-dashboard/profile/lectures`);
          }, 2000);
        } catch (error) {
          showAlert(
            error.response?.data?.message || "Failed to process payment.",
            "error"
          );
        } finally {
          setPaymentLoading(false);
        }
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response) {
      showAlert(`Payment failed! Reason: ${response.error.description}`, "error");
    });
    razorpay.open();
  };

  const scrollToPayment = () => {
    const paymentSection = document.getElementById("payment-section");
    if (paymentSection) {
      paymentSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 p-2 lg:p-8 bg-gradient-to-br from-gray-950 via-black to-blue-950 min-h-screen text-white">
      <div className="w-full lg:w-2/3 bg-gray-900 p-2 lg:p-8 rounded-lg lg:rounded-2xl shadow-lg lg:shadow-2xl border border-gray-800 overflow-y-auto max-h-screen">
        {roadmapData ? (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-2 lg:p-6 rounded-lg lg:rounded-t-2xl">
              <h1 className="text-xl lg:text-4xl font-bold text-white">{roadmapData.courseName || "Course Name"}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-6 mt-2 lg:mt-6">
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Project-Based Learning</h2>
                    <p className="mt-1 lg:mt-2 text-gray-300">Hands-on projects to solidify your skills.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Live Classes</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Interactive live classes</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Recording Access</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Revisit lessons anytime, anywhere.</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">24x7 Doubt Solving</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Get your queries resolved instantly.</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Certification</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Earn a certificate upon course completion.</p>
              </div>
              <div className="bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700 hover:border-purple-500 transition-all">
                <h2 className="text-lg lg:text-xl font-semibold text-purple-400">Free Internship</h2>
                <p className="mt-1 lg:mt-2 text-gray-300">Get free internship opportunity with certificate</p>
              </div>
            </div>
            <div className="mt-4 lg:mt-8">
              <h2 className="text-lg lg:text-2xl font-bold text-white">Skills You'll Learn</h2>
              {roadmapData.skills && roadmapData.skills.map((skill, index) => (
                <div key={index} className="collapse collapse-arrow bg-gray-800 mt-2 lg:mt-4 border border-gray-700 rounded-lg shadow-lg">
                  <input type="radio" name="my-accordion-2" />
                  <div className="collapse-title text-lg lg:text-xl font-medium text-purple-400">
                    {skill.skillName || "Skill"}
                  </div>
                  <div className="collapse-content">
                    <ul className="list-disc pl-4 lg:pl-6 text-gray-300">
                      {skill.subTopics && skill.subTopics.map((subTopic, subIndex) => (
                        <li key={subIndex}>{subTopic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 lg:mt-8 bg-gray-800 p-2 lg:p-6 rounded-lg shadow-lg border border-gray-700">
              <div className="flex items-center gap-2 lg:gap-4">
                <img
                  src={roadmapData.tutorImageUrl || "https://via.placeholder.com/100"}
                  alt={roadmapData.tutorName || "Tutor"}
                  className="w-16 h-16 lg:w-24 lg:h-24 rounded-lg border-2 border-purple-500 object-cover"
                />
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-purple-400">{roadmapData.tutorName || "Tutor Name"}</h2>
                  <p className="mt-1 lg:mt-2 text-gray-300">{roadmapData.tutorDescription || "Tutor description goes here."}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-300">Loading roadmap details...</p>
        )}
      </div>

      <div id="payment-section" className="w-full lg:w-1/3 bg-gray-900 p-2 lg:p-8 rounded-lg lg:rounded-2xl shadow-lg lg:shadow-2xl border border-gray-800 lg:sticky lg:top-8 bottom-0">
        {courseData ? (
          <>
            <h1 className="text-lg lg:text-2xl font-bold text-white">{courseData.courseName || "Course Name"}</h1>
            <img
              src={courseData.imageUrl || "https://via.placeholder.com/300"}
              alt={courseData.courseName || "Course"}
              className="w-full h-32 lg:h-48 object-cover rounded-lg mt-2 lg:mt-4"
            />
            <h2 className="text-base lg:text-xl font-semibold text-gray-400 mt-2 lg:mt-4 line-through">
              Original Price: ₹{courseData.price || "0"}
            </h2>
            <h2 className="text-base lg:text-xl font-semibold text-purple-400">
              Offer Price: ₹{Math.floor((courseData.offerPrice || courseData.price || 0).toFixed(2))} (70% OFF)
            </h2>
            <p className="text-gray-300 mt-1 lg:mt-2">
              Tax (5%): ₹{((courseData.offerPrice || courseData.price || 0) * 0.05).toFixed(2)}
            </p>
            <p className="text-gray-300 mt-1 lg:mt-2">
              Tax Discount: -₹{((courseData.offerPrice || courseData.price || 0) * 0.05).toFixed(2)}
            </p>
            <p className="text-lg lg:text-xl font-semibold text-purple-400 mt-2 lg:mt-4">
              Total: ₹{Math.floor((courseData.offerPrice || courseData.price || 0).toFixed(2))}
            </p>

            {/* Coupon Code Section */}
            <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-white mb-2">
                Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  disabled={couponValid}
                />
                <button
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon || couponValid || !couponCode.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {validatingCoupon ? "Validating..." : couponValid ? "Applied" : "Apply"}
                </button>
              </div>
              {couponMessage && (
                <p className={`text-sm mt-2 ${couponValid ? "text-green-400" : "text-red-400"
                  }`}>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Privacy Policy Link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                By purchasing, you agree to our{' '}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Show different buttons based on coupon validity */}
            {couponValid ? (
              <button
                className="w-full mt-2 lg:mt-6 text-white py-2 lg:py-3 rounded-lg font-semibold transition-all shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-green-500/50 disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleFreeEnrollment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Enroll for FREE
                  </>
                )}
              </button>
            ) : (
              <button
                className="w-full mt-2 lg:mt-6 text-white py-2 lg:py-3 rounded-lg font-semibold transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50 disabled:opacity-50"
                onClick={handlePayment}
                disabled={paymentLoading || !razorpayLoaded}
              >
                {paymentLoading ? "Processing..." : "Buy Now"}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-300">Loading course details...</p>
        )}
      </div>

      {!isPaymentSectionVisible && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 p-2 shadow-lg border-t border-gray-800 z-[50]">
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50"
            onClick={scrollToPayment}
          >
            Buy Now
          </button>
        </div>
      )}

      {alert && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[50] ${alert.type === "success" ? "bg-green-600" : "bg-red-600"
            } flex flex-col w-80 ${alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center space-x-2">
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={dismissAlert}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="w-full h-1 mt-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Success Celebration Modal - Clean Design */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-1 max-w-lg w-full">
            <div className="bg-gray-900 rounded-xl p-8 md:p-10">

              {/* Countdown */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
                  <span className="text-6xl font-black text-white">{countdown}</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">
                  🎉 Success!
                </h2>
                <p className="text-xl text-gray-300">
                  Course enrolled for <span className="text-green-400 font-bold">FREE</span>
                </p>
              </div>

              {/* Course Details */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <i className="bi bi-trophy-fill text-2xl text-white"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Course Name</p>
                    <p className="text-lg font-bold text-white">{courseData?.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400">Price Paid</span>
                  <span className="text-2xl font-bold text-green-400">FREE</span>
                </div>
              </div>

              {/* Redirect Message */}
              <div className="text-center">
                <p className="text-gray-400 mb-2">Taking you to your courses...</p>
                <p className="text-white font-semibold">{11 - countdown} seconds</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyNow;