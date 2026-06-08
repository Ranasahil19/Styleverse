import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const dashboardByRole = {
  0: '/admin/dashboard',
  1: '/seller/dashboard'
};

const GuestRoute = ({ children }) => {
  const authRole = useSelector((state) => state.auth.role);
  const storedRole = localStorage.getItem('sellerRole');
  const role = authRole !== null && authRole !== undefined ? Number(authRole) : Number(storedRole);

  if (storedRole !== null && dashboardByRole[role]) {
    return <Navigate to={dashboardByRole[role]} replace />;
  }

  return children;
};

GuestRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default GuestRoute;
