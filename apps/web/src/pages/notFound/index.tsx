import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-[#4EF08A] to-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🐍</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-400">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="space-y-3 space-x-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지
          </Button>
          <Link to="/">
            <Button className="w-full sm:w-auto bg-[#4EF08A] hover:bg-[#3DD174] text-black font-semibold">
              <Home className="w-4 h-4 mr-2" />
              홈으로 이동
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
