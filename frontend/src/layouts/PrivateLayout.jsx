import Navbar from "../components/Navbar";

const PrivateLayout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>{children}</div>
  </>
);

export default PrivateLayout;
