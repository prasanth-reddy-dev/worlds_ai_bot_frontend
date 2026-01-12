import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Country, State } from "country-state-city";
import Footer from '../../components/Footer';
import { BACKEND_URL } from '../../../config/constant';

const FreeClass = (props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 0,
    seconds: 0,
  });
  const [seatsLeft] = useState(15);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    course: "",
  });
  const [states, setStates] = useState([]);
  const [countries] = useState(Country.getAllCountries());
  const [errors, setErrors] = useState({});
  const [bootcampData, setBootcampData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(100);

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

  useEffect(() => {
    const fetchBootcamp = async () => {
      try {
        showAlert("Loading bootcamp data...", "info");
        // Fetch actual bootcamp data
        const response = await axios.get(`${BACKEND_URL}/show-bootcamp/${id}`, { withCredentials: true });
        setBootcampData(response.data);
        setFormData((prev) => ({
          ...prev,
          course: response.data.courseName || response.data.roadMapName,
        }));
        setLoading(false);
        showAlert("Bootcamp data loaded successfully!", "success");
      } catch (error) {
        showAlert(
          error.response?.data?.message || "Failed to fetch bootcamp data.",
          "error"
        );
        setLoading(false);
      }
    };
    fetchBootcamp();
  }, [id]);

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setFormData({ ...formData, country: countryCode, state: "" });
    const countryStates = State.getStatesOfCountry(countryCode);
    setStates(countryStates);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "mobile") {
      if (value.length !== 10 || isNaN(value)) {
        setErrors({ ...errors, mobile: "Mobile number must be 10 digits." });
      } else {
        setErrors({ ...errors, mobile: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required.";
    if (formData.mobile.length !== 10 || isNaN(formData.mobile))
      newErrors.mobile = "Mobile number must be 10 digits.";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.course) newErrors.course = "Course is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showAlert("Please fill all required fields correctly.", "error");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/create-register`, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        country: formData.country,
        state: formData.state,
        course: formData.course,
        bootcampId: id,
      });
      if (response.status === 200) {
        setShowRegistration(false);
        showAlert("Registration successful!", "success");
        navigate("/register-successful");
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "An error occurred while submitting the form. Please try again.",
        "error"
      );
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const reviews = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Junior Developer",
      content: "This bootcamp transformed my career. The hands-on projects were invaluable.",
      rating: 5,
    },
    {
      id: 2,
      name: "Mike Johnson",
      role: "Career Switcher",
      content: "Great curriculum and amazing support from instructors.",
      rating: 5,
    },
    {
      id: 3,
      name: "Alex Rivera",
      role: "Student",
      content: "Perfect for beginners. Made complex concepts easy to understand.",
      rating: 4,
    },
    {
      id: 4,
      name: "Priya Sharma",
      role: "Freelancer",
      content: "The bootcamp helped me land my first freelance project. Highly recommended!",
      rating: 5,
    },
    {
      id: 5,
      name: "David Kim",
      role: "Student",
      content: "The instructors are top-notch. I learned so much in just a few days!",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Who is this bootcamp for?",
      answer: "This bootcamp is designed for beginners and intermediate learners who want to master the subject in a short time.",
    },
    {
      question: "Do I need prior experience?",
      answer: "No prior experience is required. We start from the basics and guide you step-by-step.",
    },
    {
      question: "What will I achieve after the bootcamp?",
      answer: "You'll have a solid foundation, build real-world projects, and be ready to start your career.",
    },
    {
      question: "What tools or software do I need?",
      answer: "You'll need a laptop with basic software installed. All other tools will be provided during the bootcamp.",
    },
    {
      question: "Is there a certificate provided?",
      answer: "Yes, you'll receive a certificate of completion after successfully finishing the bootcamp.",
    },
    {
      question: "Can I get a refund if I cancel?",
      answer: "Yes, we offer a full refund if you cancel within 7 days of the bootcamp start date.",
    },
    {
      question: "Will I get lifetime access to the materials?",
      answer: "Yes, you'll have lifetime access to all the course materials and resources.",
    },
    {
      question: "How do I join the WhatsApp group?",
      answer: "After registration, you'll receive a link to join the WhatsApp group for updates and support.",
    },
  ];

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!bootcampData) {
    return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Bootcamp not found</div>;
  }

  const startDate = bootcampData.startDate ? new Date(bootcampData.startDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  }) : "TBD";
  const endDate = bootcampData.endDate ? new Date(bootcampData.endDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  }) : "TBD";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 text-white pb-24">
      {/* Alert Component */}
      {alert && (
        <div
          className={`fixed top-[85px] left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg text-white shadow-lg transition-all duration-300 z-[100] ${alert.type === 'success'
            ? 'bg-green-600'
            : alert.type === 'info'
              ? 'bg-blue-600'
              : 'bg-red-600'
            } flex flex-col w-80 sm:bottom-4 sm:right-4 sm:top-auto sm:left-auto sm:translate-x-0 opacity-0 ${alert.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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

      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Get Started with {bootcampData.days || 'Free'} Days {bootcampData.roadMapName || bootcampData.courseName} Bootcamp for Free
        </h1>
        <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
          Dive into {bootcampData.roadMapName || bootcampData.courseName} and kickstart your journey with hands-on learning!
        </p>
        <p className="text-lg text-blue-400 mb-8">
          {startDate} to {endDate} | {bootcampData.startTime || '7:00'} PM IST
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setShowRegistration(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Register Now - FREE
          </button>
          <p className="text-gray-400">Limited seats available!</p>
        </div>
      </header>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Bootcamp Schedule
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {bootcampData.courseRoadmap && Array.isArray(bootcampData.courseRoadmap) ? bootcampData.courseRoadmap.map((dayContent, index) => (
            <div
              key={index}
              className="bg-blue-900/20 p-6 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all"
            >
              <div className="text-blue-400 font-bold mb-2">Day {index + 1}</div>
              <h3 className="text-xl font-bold mb-2">{dayContent[0]}</h3>
              <p className="text-gray-400">{dayContent[1]}</p>
            </div>
          )) : (
            <div className="col-span-2 text-center text-gray-400 py-8">
              <p>Course roadmap coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {bootcampData.videoUrl && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Bootcamp Overview Video
          </h2>
          <div className="w-full max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-[250px] md:h-[500px] rounded-xl"
                src={bootcampData.videoUrl}
                title={`${bootcampData.roadMapName || bootcampData.courseName} Overview Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      )}

      {bootcampData.instructors && Array.isArray(bootcampData.instructors) && bootcampData.instructors.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Meet Your Instructors
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {bootcampData.instructors.map((instructor, index) => (
              <div
                key={index}
                className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/30"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  {instructor.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold">{instructor.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{instructor.role}</p>
                <p className="text-gray-300">{instructor.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-12 mb-24 md:mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Student Reviews</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/30"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                  {review.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="font-bold">{review.name}</div>
                  <div className="text-gray-400 text-sm">{review.role}</div>
                </div>
              </div>
              <p className="text-gray-300">{review.content}</p>
              <div className="mt-4 flex">
                {[...Array(review.rating)].map((_, i) => (
                  <div key={i} className="text-yellow-500">
                    ★
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">FAQs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900/50 p-6 rounded-xl border border-gray-800/30"
            >
              <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer {...props} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent backdrop-blur-sm border-t border-blue-900/30">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-blue-300 mb-1">
                Time Left to Register
              </div>
              <div className="flex gap-4 text-xl font-bold">
                <div>{timeLeft.hours}h</div>
                <div>{timeLeft.minutes}m</div>
                <div>{timeLeft.seconds}s</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-blue-300 mb-1">Available Seats</div>
              <div className="text-xl font-bold">{seatsLeft}</div>
            </div>
          </div>
          <button
            onClick={() => setShowRegistration(true)}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Register Now - FREE
          </button>
        </div>
      </div>

      {showRegistration && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl p-8 max-w-md w-full border border-blue-800/50">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Register for {bootcampData.roadMapName || bootcampData.courseName} Bootcamp
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your mobile number"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your state</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg bg-blue-900/30 border border-blue-800/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-blue-800/50 hover:bg-blue-900/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Register Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeClass;