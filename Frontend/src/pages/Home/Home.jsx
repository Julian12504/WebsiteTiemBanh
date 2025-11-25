import {useState} from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreCategories from '../../components/ExploreCategories/ExploreCategories'
import ItemDisplay from '../../components/ItemDisplay/ItemDisplay'
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs'

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