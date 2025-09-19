import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import MerchantAuth from "@/components/MerchantAuth";

const PublicContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/merchant" element={<MerchantAuth />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
};

export default PublicContent;