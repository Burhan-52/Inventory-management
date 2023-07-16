import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ProductTable from './ProductTable';
import { Context } from '../App';
import { Navigate } from "react-router-dom";
import searchlogo from '../assessts/search.png'
import '../index.css';

const AddProduct = () => {

    const { isAuthenticated, user } = useContext(Context)

    const [product, setProduct] = useState({
        productname: '',
        quantity: '',
        price: ''
    });
    const [productList, setProductList] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [search, setSearch] = useState("")
    const [searchdata, setsearchdata] = useState([])
    const [loading, setLoading] = useState(false)
    const [updateloading, setupdateloading] = useState(false)


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: user._id,
                    name: product.productname,
                    quantity: product.quantity,
                    price: product.price
                }),
            }

            const response = await fetch("http://localhost:8000/product", requestOptions)
            const data = await response.json();
            setRefresh((prev) => !prev)
            toast.success(data.message);
        } catch (error) {
            toast.error(error)
            console.log(error)
        }

        setProduct({
            productname: '',
            quantity: '',
            price: ''
        })
    };

    const getproductlist = async () => {
        setLoading(false)
        try {
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
            const response = await fetch(`http://localhost:8000/product/products/${user._id}`, requestOptions)
            const data = await response.json();
            setProductList(data.products)
        } catch (error) {
            console.log(error)
        }
    }

    const deleteproduct = async (id) => {
        try {
            const requestOptions = {
                method: 'DELETE',
            }
            const response = await fetch(`http://localhost:8000/product/${id}`, requestOptions)
            const data = await response.json();
            setRefresh((prev) => !prev)
            toast.success(data.message);
        } catch (error) {
            console.log(error)
        }
    }

    const searchProduct = async () => {
        setLoading(true)
        try {
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
            const response = await fetch(`http://localhost:8000/product/${user._id}?search=${search}`, requestOptions)
            const data = await response.json();
            setsearchdata(data)
            setLoading(false)
        } catch (error) {
            console.log(error)
        }
    }

    const updateQuantity = async (productId, operation) => {
        setupdateloading(true)
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    operation
                }),
            }
            const response = await fetch(`http://localhost:8000/product/update`, requestOptions)
            const data = await response.json();
            setupdateloading(false)
            setRefresh((prev) => !prev)

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        searchProduct()
    }, [refresh, search])

    useEffect(() => {
        getproductlist()
    }, [refresh])

    if (!isAuthenticated) {
        return <Navigate to={"/login"} />
    }

    return (
        <div className="max-w-full mx-auto mt-8 px-4">

            {/* Add a sereach bar with button */}

            <div className="mb-2">
                <div className="flex justify-center">
                    <input
                        type="text"
                        placeholder="Search a product by Name"
                        className="shadow appearance-none border rounded w-full sm:w-[50rem] py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="flex items-center mx-2">
                        <img src={searchlogo} alt="searchlogo" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" stroke="#3498db">
                            <g fill="none" fillRule="evenodd">
                                <g transform="translate(2 2)" strokeWidth="4">
                                    <circle cx="18" cy="18" r="18" strokeOpacity="0.5">
                                        <animate attributeName="r" begin="0s" dur="1.8s" values="18;14;12;10;8;6;4;2;18" calcMode="linear" repeatCount="indefinite" />
                                        <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="0.5;0.45;0.4;0.35;0.3;0.25;0.2;0.15;0.5" calcMode="linear" repeatCount="indefinite" />
                                    </circle>
                                    <path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(231.764 18 18)">
                                        <animate attributeName="stroke-dashoffset" begin="0s" dur="1.8s" values="0;49.94;49.94;0" calcMode="linear" repeatCount="indefinite" />
                                        <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1;0;0;1" calcMode="linear" repeatCount="indefinite" />
                                    </path>
                                </g>
                            </g>
                        </svg>
                    </div>
                ) : search.length > 0 && (
                    <div className="bg-white mt-4 absolute left-[16rem] shadow-lg search-container">
                        {searchdata.length <= 0 ? (
                            <p className="text-red-500">Product not found</p>
                        ) : (
                            <div className="flex flex-col items-center w-[800px] search-item">
                                {searchdata.map((searchItem) => (
                                    <div
                                        key={searchItem._id}
                                        className="flex w-full bg-white justify-between items-center px-4 py-1 rounded-md"
                                    >
                                        <div className="cursor-pointer">
                                            {`${searchItem.name} (${searchItem.quantity} available for ₹ ${searchItem.price})`}
                                        </div>

                                        <div className="flex items-center">
                                            <button
                                                onClick={() => updateQuantity(searchItem._id, "sub")}
                                                disabled={searchItem.quantity <= 0 || updateloading}
                                                className={`bg-red-500 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ${searchItem.quantity <= 0 || updateloading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                                    }`}
                                            >
                                                -
                                            </button>

                                            <div className="mx-3">{searchItem.quantity}</div>

                                            <button
                                                onClick={() => updateQuantity(searchItem._id, "add")}
                                                disabled={updateloading}
                                                className={`bg-green-500 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ${updateloading ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <input
                    type="text"
                    placeholder="Product Name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline"
                    value={product.productname}
                    required
                    onChange={(e) => setProduct({ ...product, productname: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline"
                    value={product.quantity}
                    required
                    onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
                   
                />
                <input
                    type="number"
                    placeholder="Price"
                    className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 leading-tight focus:outline-none focus:shadow-outline"
                    value={product.price}
                    required
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                />
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Add Product
                </button>
            </form>

            <ProductTable productList={productList} deleteproduct={deleteproduct} />

        </div >
    );
};

export default AddProduct;
