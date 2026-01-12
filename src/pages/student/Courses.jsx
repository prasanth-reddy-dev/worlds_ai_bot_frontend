import React from 'react'
import Footer from '../../components/Footer'
import CourseCards from '../../components/CourseCards'
function Courses(props) {
  return (
    <div>
      <CourseCards/>
      <Footer {...props}/>
    </div>
  )
}

export default Courses