import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../config/constant";

function Course(props) {
  const discountedPrice = props.data.price - Math.floor(props.data.price * 0.7);
  
  return (
    <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-blue-900 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl w-full min-w-[280px] max-w-[320px] group">
      {/* Glowing Effect on Hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 blur-md"></div>

      <div className="relative rounded-xl overflow-hidden bg-gray-900 h-full flex flex-col">
        {/* Image section */}
        <figure className="relative h-48 w-full overflow-hidden flex-shrink-0">
          <img
            src={props.data.imageUrl}
            alt="Course"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent px-5 pb-4 pt-8">
            <h2 className="text-xl font-bold text-white line-clamp-1">
              {props.data.courseName}
            </h2>
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 text-transparent bg-clip-text text-sm font-medium">
              English
            </span>
          </div>
        </figure>

        {/* Content section */}
        <div className="p-5 bg-gradient-to-b from-gray-900 to-blue-950 flex-grow flex flex-col">
          {/* Top info row */}
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                <span className="block">Mode:</span>
                <span className="font-medium text-white">Online</span>
              </p>
              <p className="text-xs text-gray-400">
                <span className="block">Status:</span>
                <span className="text-teal-400 font-medium">Ongoing</span>
              </p>
            </div>
            
            <div className="space-y-1 text-right">
              <p className="text-xs text-gray-400">
                <span className="block">Duration:</span>
                <span className="font-medium text-white">
                  {props.data.duration} days
                </span>
              </p>
              <p className="text-xs text-gray-400">
                <span className="block">Price:</span>
                <span className="font-medium text-white">
                  <span className="line-through text-gray-400 mr-1">
                    ₹{props.data.price}
                  </span>
                  ₹{discountedPrice}
                </span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 my-3"></div>

          {/* Features list */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-teal-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-xs text-gray-300">
                <span className="text-gray-400">Free Internship: </span>
                <span className="text-teal-400 font-medium">Available</span>
              </p>
            </div>
            
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-xs text-gray-300">
                <span className="text-gray-400">Certificate: </span>
                <span className="font-medium text-white">Completion + Internship</span>
              </p>
            </div>
            
            <div className="flex items-start">
              <svg className="w-4 h-4 text-purple-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-xs text-gray-300">
                <span className="text-gray-400">Recordings: </span>
                <span className="font-medium text-white">{props.data.hours}+ hrs</span>
              </p>
            </div>
          </div>

          {/* Button - pushed to bottom */}
          <div className="mt-auto pt-4">
            <Link to={`/buy-now/${props.data.nextId}/${props.data._id}`}>
              <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg px-4 py-2.5 text-white font-semibold text-xs uppercase tracking-wide hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center">
                <span>Visit & Buy Now</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCards() {
  const [courses, setCourses] = useState([]);

  async function fetchCourses() {
    const response = await axios.get(`${BACKEND_URL}/show-courses`, {
      withCredentials: true,
    });
    setCourses(response?.data?.data);
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-white bg-gray-900">
        No courses found
      </div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      <div className="bg-gray-900 p-4 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-none px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 sm:mb-12 bg-gradient-to-r from-teal-400 to-blue-400 text-transparent bg-clip-text">
            Discover Your Path to Mastery
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
            {courses.map((x, index) => (
              <Course key={index} data={x} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCards;
