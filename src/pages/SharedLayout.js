import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const SharedLayout = ({ setWallet, walletAddress }) => {
    return (
        <div className="wrapper">
            <Navbar walletAddress={(setWallet, walletAddress)} />
            <Outlet />
            <Footer />
        </div>
    )
}
export default SharedLayout
