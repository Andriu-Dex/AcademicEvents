import Navbar from "../components/Navbar";

const PrivateLayout = ({ children }) => (
  <>
    <Navbar />
    {/* <main className="p-4">{children}</main> */}
    <main style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>{children}</main>
  </>
);

export default PrivateLayout;
