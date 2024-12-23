import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Trash2, Plus} from 'lucide-react';

// const PRODUCT_DATA = [
//     { id: 1, name: "Wireless Earbuds", category: "Electronics", price: 59.99, stock: 143, sales: 1200 },
//     { id: 2, name: "Leather Wallet", category: "Accessories", price: 39.99, stock: 89, sales: 800 },
//     { id: 3, name: "Smart Watch", category: "Electronics", price: 199.99, stock: 56, sales: 650 },
//     { id: 4, name: "Yoga Mat", category: "Fitness", price: 29.99, stock: 210, sales: 950 },
//     { id: 5, name: "Coffee Maker", category: "Home", price: 79.99, stock: 78, sales: 720 },
// ];

const CROPS_DATA =[
    {CropID: 1, GrowthStage: "ini : 10 , mid : 50, end : 60", ImageURL : "", kc: "ini : 0.7 , mid : 1, end : 0.95", nameAR: "خس", nameEN: "Lettuce"},
    {CropID: 2, GrowthStage: "ini : 15 , mid : 85, end : 100", ImageURL : "", kc: "ini : 0.3 , mid : 1.15, end : 1.79585632602", nameAR: "ذرة", nameEN: "Sweet corn"},
    {CropID: 3, GrowthStage: "ini : 15 , mid : 60, end : 70", ImageURL : "", kc: "ini : 0.5 , mid : 1.05, end : 0.95", nameAR: "شمندر", nameEN: "Beetroot"},
    {CropID: 4, GrowthStage: "ini : 20 , mid : 75, end : 90", ImageURL : "", kc: "ini : 0.6 , mid : 1.05, end : 0.9", nameAR: "باذنجان", nameEN: "Eggplants"},
    {CropID: 5, GrowthStage: "ini : 20 , mid : 80, end : 100", ImageURL : "https://saqidev-mun-aquacrop-s3st-cropsimagesbucket37842e6-jwc87ujx6vua.s3.us-east-1.amazonaws.com/images/cauliflower.png", kc: "ini : 0.7 , mid : 1.05, end : 0.95", nameAR: "قرنبيط", nameEN: "Cauliflower"},
]

const CropsTable: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCrops, setFilteredCrops] = useState(CROPS_DATA);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = CROPS_DATA.filter(
                (crop) =>
                    crop.nameEN.toLowerCase().includes(term) || crop.nameAR.includes(term)
            );

        setFilteredCrops(filtered);
    }

    // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const term = e.target.value.toLowerCase();
    //     setSearchTerm(term);
    //     const filtered = crop.filter(
    //         (crop) =>
    //             crop.name.toLowerCase().includes(term) || crop.category.toLowerCase().includes(term)
    //     );
    //
    //     setFilteredcrop(filtered);
    // };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Crops List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search Crops...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                    <tr>
                        {/*<th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>*/}
                        {/*    Image*/}
                        {/*</th>*/}
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            Crop ID
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            nameEN
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            nameAR
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            GrowthStage
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            kc
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                            Actions
                        </th>
                    </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                    {filteredCrops.map((crop) => (
                        <motion.tr
                            key={crop.CropID}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.3}}
                        >
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                <img
                                    src='https://images.unsplash.com/photo-1627989580309-bfaf3e58af6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2lyZWxlc3MlMjBlYXJidWRzfGVufDB8fDB8fHww'
                                    alt='Product img'
                                    className='size-10 rounded-full'
                                />
                                {product.name}
                            </td>

                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                {product.category}
                            </td>

                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                ${product.price.toFixed(2)}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.stock}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.sales}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.sales}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                    <Edit size={18}/>
                                </button>
                                <button className='text-red-400 hover:text-red-300'>
                                    <Trash2 size={18}/>
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default CropsTable;
