import React from 'react'
import { Route, Routes } from 'react-router-dom'
import PolicySearch from './PolicySearch'
import PolicyPage from './PolicyPage'


function Policy() {
  return (
    <Routes>
    <Route path="/" element={<PolicyPage/>}  />
    <Route path="/search" element={<PolicySearch />}/>
    </Routes>
  )
}

export default Policy