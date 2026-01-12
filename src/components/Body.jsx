import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useDispatch } from "react-redux";
import APIService from "../services/api";
import { setUser } from "../redux/userSlice";

function Body(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await APIService.profile.getMe();
          if (res.status === 200) {
            dispatch(setUser(res.data));
          }
        }
      } catch (err) {
        // Silently handle - user is not logged in or token expired
        // This is fine for public pages
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <div>
      <Navbar {...props} />
      <Outlet />
    </div>
  );
}

export default Body;
