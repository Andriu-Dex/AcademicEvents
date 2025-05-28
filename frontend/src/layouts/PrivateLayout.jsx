import Navbar from "../components/Navbar";

const PrivateLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="p-4">{children}</main>
  </>
);

export default PrivateLayout;
