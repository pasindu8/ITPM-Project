
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Logout() {
  const navigate = useNavigate();

  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, logout",
    confirmButtonColor: "#d33"
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login", { replace: true });
      window.location.reload();
    } else {
      navigate("/", { replace: true });
    }
  });

  return null;
}

export default Logout;
