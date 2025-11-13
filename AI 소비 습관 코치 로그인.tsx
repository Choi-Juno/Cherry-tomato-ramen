import React, { useState } from 'react';
import { Eye, EyeOff, Wallet, TrendingDown, Target, PiggyBank, CreditCard, BarChart3 } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'test@test.com', password: '12345678', name: '테스트 유저' }
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleRegister = (userData) => {
    setRegisteredUsers([...registeredUsers, userData]);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  if (currentScreen === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (currentScreen === 'signup') {
    return <SignupScreen onBack={() => setCurrentScreen('login')} onSignup={handleLogin} onRegister={handleRegister} />;
  }

  return <LoginScreen onLogin={handleLogin} onSignup={() => setCurrentScreen('signup')} registeredUsers={registeredUsers} />;
}

function LoginScreen({ onLogin, onSignup, onForgotPassword, registeredUsers }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // 등록된 사용자 확인
    const user = registeredUsers.find(u => u.email === email);
    
    if (!user) {
      setError('등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.');
      return;
    }

    if (user.password !== password) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 로그인 성공
    onLogin({ email: user.email, name: user.name, loginMethod: 'email' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 소비 습관 코치</h1>
          <p className="text-gray-600">현명한 소비를 위한 당신의 파트너</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">로그인 상태 유지</span>
              </label>
              <button onClick={onForgotPassword} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                비밀번호 찾기
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
            >
              로그인
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-gray-600">
            아직 계정이 없으신가요?{' '}
            <button onClick={onSignup} className="text-blue-600 hover:text-blue-700 font-medium">
              회원가입
            </button>
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-gray-500">
          로그인하시면 <button className="underline hover:text-gray-700">이용약관</button> 및{' '}
          <button className="underline hover:text-gray-700">개인정보처리방침</button>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

function SignupScreen({ onBack, onSignup, onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // 비밀번호 길이 검증
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (!agreeTerms || !agreePrivacy) {
      setError('약관에 동의해주세요.');
      return;
    }

    // 회원가입 정보 저장
    onRegister({ email, password, name });
    // 자동 로그인
    onSignup({ email, name, loginMethod: 'email' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            ← 돌아가기
          </button>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">AI 소비 습관 코치와 함께 시작하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8자 이상 입력"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                />
                <span className="ml-2 text-sm text-gray-700">
                  <span className="text-red-500">*</span> 이용약관에 동의합니다
                </span>
              </label>
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                />
                <span className="ml-2 text-sm text-gray-700">
                  <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl"
            >
              가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI 소비 습관 코치</h1>
              <p className="text-xs text-gray-500">{user.name}님 환영합니다</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">로그아웃 하시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-6">다음에 다시 로그인해야 합니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">{user.name}님, 환영합니다! 👋</h2>
          <p className="text-blue-100">이번 달 소비 패턴을 분석하고 개선해보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<TrendingDown className="w-6 h-6" />}
            title="이번 달 지출"
            value="₩1,234,000"
            change="-12%"
            positive={true}
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="예산 달성률"
            value="76%"
            change="+8%"
            positive={true}
          />
          <StatCard
            icon={<PiggyBank className="w-6 h-6" />}
            title="이번 달 절약"
            value="₩340,000"
            change="+24%"
            positive={true}
          />
          <StatCard
            icon={<CreditCard className="w-6 h-6" />}
            title="활성 카드"
            value="3장"
            change="변동 없음"
            positive={null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">카테고리별 지출</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <CategoryBar label="식비" amount="₩450,000" percentage={36} color="bg-blue-500" />
              <CategoryBar label="교통" amount="₩280,000" percentage={23} color="bg-green-500" />
              <CategoryBar label="쇼핑" amount="₩320,000" percentage={26} color="bg-purple-500" />
              <CategoryBar label="기타" amount="₩184,000" percentage={15} color="bg-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">AI 소비 조언</h3>
            <div className="space-y-4">
              <RecommendationCard
                title="식비 절약 기회"
                description="외식비가 평균보다 40% 높습니다. 주 2회 외식을 줄이면 월 ₩120,000 절약 가능해요."
                type="warning"
              />
              <RecommendationCard
                title="잘하고 계세요!"
                description="교통비를 효율적으로 관리하고 있어요. 이번 달 대중교통 이용이 20% 증가했습니다."
                type="success"
              />
              <RecommendationCard
                title="카드 혜택 활용"
                description="현대카드 M포인트 5,000P가 이번 달 말 소멸될 예정입니다."
                type="info"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">최근 거래</h3>
          <div className="space-y-4">
            <TransactionItem
              icon="🍔"
              title="맥도날드 강남점"
              date="오늘 12:34"
              amount="-₩12,500"
              category="식비"
            />
            <TransactionItem
              icon="🚇"
              title="지하철 2호선"
              date="오늘 09:15"
              amount="-₩1,400"
              category="교통"
            />
            <TransactionItem
              icon="☕"
              title="스타벅스 역삼점"
              date="어제 15:20"
              amount="-₩5,500"
              category="식비"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, change, positive }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          {icon}
        </div>
        {positive !== null && (
          <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
        {positive === null && (
          <span className="text-sm font-medium text-gray-500">{change}</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function CategoryBar({ label, amount, percentage, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{amount}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function RecommendationCard({ title, description, type }) {
  const bgColor = {
    warning: 'bg-yellow-50 border-yellow-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200'
  }[type];

  const iconColor = {
    warning: 'text-yellow-600',
    success: 'text-green-600',
    info: 'text-blue-600'
  }[type];

  return (
    <div className={`${bgColor} border rounded-lg p-4`}>
      <h4 className={`font-medium ${iconColor} mb-1`}>{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function TransactionItem({ icon, title, date, amount, category }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{date} · {category}</p>
        </div>
      </div>
      <p className="font-bold text-gray-900">{amount}</p>
    </div>
  );
}