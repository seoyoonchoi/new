import React from 'react'
import { Route, Routes } from 'react-router-dom'
import StockSearch from './StockSearch'
import StockPage from './StockPage'

function Stock() {
  return (
    <Routes>
    <Route path="/search" element={<StockSearch/>}  />
    <Route path="/" element={<StockPage />}/>
    </Routes>
  )
}

export default Stock