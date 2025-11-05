import {useState} from 'react'
import './Home.css'
import Header from '../../Components/Header/Header'
import ExploreCategories from '../../Components/ExploreCategories/ExploreCategories'
import ItemDisplay from '../../Components/ItemDisplay/ItemDisplay'
import WhyChooseUs from '../../Components/WhyChooseUs/WhyChooseUs'

const Home = () => {
  const[category,setCategory]=useState("All");
  return (
    <div className='home'>
        <Header/>
        <ExploreCategories category={category} setCategory={setCategory}/>
        <ItemDisplay category={category}/>
        <WhyChooseUs/>
    </div>
  )
}

export default Home