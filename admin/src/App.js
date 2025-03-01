import { useDispatch, useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// routing
import Routes from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import { useEffect } from 'react';
import { getNotification } from 'features/notificationSlice';
import { io } from 'socket.io-client';
// ==============================|| APP ||============================== //

const socket = io("http://localhost:5000", { withCredentials: true });

const App = () => {
  const customization = useSelector((state) => state.customization);
  const seller = useSelector((state) => state.auth.seller)
  const sellerId = seller?._id;
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (sellerId) {
      const role = seller?.role
      socket.emit("register", { sellerId , role});
  
      const handleNotification = () => {
        dispatch(getNotification(sellerId));
      };
  
      socket.on("receiveNotification", handleNotification);
  
      return () => {
        socket.off("receiveNotification", handleNotification); // Cleanup
      };
    }
  }, [dispatch, sellerId]);  

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Routes />
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
