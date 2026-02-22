import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
	Scale,
	ShieldCheck,
	FolderKanban,
	MessagesSquare,
	FileText,
	BadgeCheck,
	Eye,
	EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATION_OPTIONS = [
	'Family Law',
	'Criminal Law',
	'Property Law',
	'Cyber Law',
	'Corporate Law',
	'Immigration Law',
	'Labour Law',
	'Tax Law',
];

const INITIAL_FORM = {
	fullName: '',
	email: '',
	phone: '',
	role: 'client',
	password: '',
	confirmPassword: '',
	termsAccepted: false,
	barLicenseNumber: '',
	yearsOfExperience: '',
	specialization: [],
	officeLocation: '',
	bio: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{7,15}$/;

const getPasswordStrength = (password) => {
	if (!password) {
		return { label: 'Enter password', tone: 'text-gray-500' };
	}

	const checks = [
		password.length >= 8,
		/[A-Z]/.test(password),
		/\d/.test(password),
		/[^A-Za-z0-9]/.test(password),
	];
	const score = checks.filter(Boolean).length;

	if (score <= 2) {
		return { label: 'Weak password', tone: 'text-red-600' };
	}

	if (score === 3) {
		return { label: 'Okay password', tone: 'text-amber-600' };
	}

	return { label: 'Strong password', tone: 'text-green-600' };
};

function Signup() {
	const navigate = useNavigate();
	const { register, isAuthenticated, user, loading: authLoading } = useAuth();
	const [formData, setFormData] = useState(INITIAL_FORM);
	const [errors, setErrors] = useState({});
	const [apiError, setApiError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		if (authLoading) {
			return;
		}

		if (isAuthenticated) {
			navigate(user?.role === 'client' ? '/client/dashboard' : '/lawyer/dashboard', { replace: true });
		}
	}, [authLoading, isAuthenticated, navigate, user]);

	const passwordStrength = useMemo(
		() => getPasswordStrength(formData.password),
		[formData.password]
	);

	const validate = (data) => {
		const nextErrors = {};

		if (!data.fullName || data.fullName.trim().length < 3) {
			nextErrors.fullName = 'Full name must be at least 3 characters';
		}

		if (!emailRegex.test(data.email || '')) {
			nextErrors.email = 'Please enter a valid email address';
		}

		if (!phoneRegex.test((data.phone || '').trim())) {
			nextErrors.phone = 'Phone must be 7–15 digits (optional + prefix)';
		}

		if ((data.password || '').length < 8) {
			nextErrors.password = 'Password must be at least 8 characters';
		} else if (!/[A-Z]/.test(data.password)) {
			nextErrors.password = 'Password must include at least one uppercase letter';
		} else if (!/\d/.test(data.password)) {
			nextErrors.password = 'Password must include at least one number';
		} else if (!/[^A-Za-z0-9]/.test(data.password)) {
			nextErrors.password = 'Password must include at least one special character';
		}

		if (data.confirmPassword !== data.password) {
			nextErrors.confirmPassword = 'Passwords do not match';
		}

		if (!data.termsAccepted) {
			nextErrors.termsAccepted = 'You must accept terms and conditions';
		}

		if (data.role === 'lawyer') {
			if (!data.barLicenseNumber || !data.barLicenseNumber.trim()) {
				nextErrors.barLicenseNumber = 'Bar license number is required';
			}

			const years = Number(data.yearsOfExperience);
			if (data.yearsOfExperience === '' || Number.isNaN(years)) {
				nextErrors.yearsOfExperience = 'Years of experience is required';
			} else if (years < 0 || years > 60) {
				nextErrors.yearsOfExperience = 'Years of experience must be between 0 and 60';
			}

			if (!Array.isArray(data.specialization) || data.specialization.length < 1) {
				nextErrors.specialization = 'Select at least one specialization';
			}

			if (!data.officeLocation || !data.officeLocation.trim()) {
				nextErrors.officeLocation = 'Office location is required';
			}

			if (!data.bio || data.bio.trim().length < 30) {
				nextErrors.bio = 'Bio must be at least 30 characters';
			}
		}

		return nextErrors;
	};

	const handleChange = (event) => {
		const { name, value, type, checked } = event.target;

		if (name === 'role') {
			setFormData((prev) => ({
				...prev,
				role: value,
				...(value === 'client'
					? {
							barLicenseNumber: '',
							yearsOfExperience: '',
							specialization: [],
							officeLocation: '',
							bio: '',
						}
					: {}),
			}));
			setErrors((prev) => ({ ...prev, role: undefined }));
			return;
		}

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));

		if (apiError) {
			setApiError('');
		}

		if (successMessage) {
			setSuccessMessage('');
		}
	};

	const handleSpecializationToggle = (value) => {
		setFormData((prev) => {
			const exists = prev.specialization.includes(value);
			return {
				...prev,
				specialization: exists
					? prev.specialization.filter((item) => item !== value)
					: [...prev.specialization, value],
			};
		});
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setApiError('');

		const validationErrors = validate(formData);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		const payload = {
			fullName: formData.fullName.trim(),
			email: formData.email.trim(),
			phone: formData.phone.trim(),
			role: formData.role,
			password: formData.password,
		};

		if (formData.role === 'lawyer') {
			payload.barLicenseNumber = formData.barLicenseNumber.trim();
			payload.yearsOfExperience = Number(formData.yearsOfExperience);
			payload.specialization = formData.specialization;
			payload.officeLocation = formData.officeLocation.trim();
			payload.bio = formData.bio.trim();
		}

		setSubmitting(true);
		try {
			const response = await register(payload);
			setSuccessMessage('Account created successfully. Redirecting to your dashboard...');

			setTimeout(() => {
				navigate(response?.user?.role === 'client' ? '/client/dashboard' : '/lawyer/dashboard', {
					replace: true,
				});
			}, 800);
		} catch (error) {
			setApiError(error.message || 'Registration failed. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl ring-1 ring-blue-100/50 overflow-hidden">
					<div className="flex flex-col lg:flex-row">
						<div className="w-full lg:w-3/5 p-8 md:p-12">
							<div className="mb-8">
								<div className="flex items-center space-x-2 mb-2">
									<Scale className="w-8 h-8 text-blue-600" />
									<h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
										LawLinkPro
									</h1>
								</div>
								<p className="text-gray-600">Join Our Legal Network</p>
							</div>

							<h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
							<p className="text-gray-600 mb-6">Register to access our legal services platform</p>

							{apiError && (
								<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
									<p className="text-red-600 text-sm">{apiError}</p>
								</div>
							)}

							{successMessage && (
								<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
									<p className="text-green-700 text-sm font-medium">{successMessage}</p>
								</div>
							)}

							<div className="my-6 flex items-center gap-3">
								<div className="h-px flex-1 bg-gray-200" />
								<span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">register with email</span>
								<div className="h-px flex-1 bg-gray-200" />
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
										Full Name
									</label>
									<input
										type="text"
										id="fullName"
										name="fullName"
										value={formData.fullName}
										onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
										placeholder="Enter your full name"
									/>
									{errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
								</div>

								<div>
									<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
										Email Address
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
										placeholder="Enter your email"
									/>
									{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
								</div>

								<div>
									<label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
										Phone Number
									</label>
									<input
										type="tel"
										id="phone"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
										placeholder="Enter your phone number"
									/>
									{errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
								</div>

								<div>
									<label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
										Role
									</label>
									<select
										id="role"
										name="role"
										value={formData.role}
										onChange={handleChange}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
									>
										<option value="client">Client</option>
										<option value="lawyer">Lawyer</option>
									</select>
								</div>

								{formData.role === 'lawyer' && (
									<div className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
										<div>
											<label htmlFor="barLicenseNumber" className="block text-sm font-semibold text-gray-700 mb-2">
												Bar License Number
											</label>
											<input
												type="text"
												id="barLicenseNumber"
												name="barLicenseNumber"
												value={formData.barLicenseNumber}
												onChange={handleChange}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
											{errors.barLicenseNumber && (
												<p className="mt-1 text-xs text-red-600">{errors.barLicenseNumber}</p>
											)}
										</div>

										<div>
											<label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-gray-700 mb-2">
												Years of Experience
											</label>
											<input
												type="number"
												id="yearsOfExperience"
												name="yearsOfExperience"
												min="0"
												max="60"
												value={formData.yearsOfExperience}
												onChange={handleChange}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
											{errors.yearsOfExperience && (
												<p className="mt-1 text-xs text-red-600">{errors.yearsOfExperience}</p>
											)}
										</div>

										<div>
											<p className="block text-sm font-semibold text-gray-700 mb-2">Specialization</p>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
												{SPECIALIZATION_OPTIONS.map((item) => (
													<label key={item} className="flex items-center gap-2 text-sm text-gray-700">
														<input
															type="checkbox"
															checked={formData.specialization.includes(item)}
															onChange={() => handleSpecializationToggle(item)}
															className="h-4 w-4"
														/>
														{item}
													</label>
												))}
											</div>
											{errors.specialization && (
												<p className="mt-1 text-xs text-red-600">{errors.specialization}</p>
											)}
										</div>

										<div>
											<label htmlFor="officeLocation" className="block text-sm font-semibold text-gray-700 mb-2">
												Office Location
											</label>
											<input
												type="text"
												id="officeLocation"
												name="officeLocation"
												value={formData.officeLocation}
												onChange={handleChange}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											/>
											{errors.officeLocation && (
												<p className="mt-1 text-xs text-red-600">{errors.officeLocation}</p>
											)}
										</div>

										<div>
											<label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
												Professional Bio
											</label>
											<textarea
												id="bio"
												name="bio"
												rows="4"
												value={formData.bio}
												onChange={handleChange}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
												placeholder="Tell clients about your experience and expertise"
											/>
											{errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio}</p>}
										</div>
									</div>
								)}

								<div>
									<label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
										Password
									</label>
									<div className="relative">
										<input
											type={showPassword ? 'text' : 'password'}
											id="password"
											name="password"
											value={formData.password}
											onChange={handleChange}
											autoComplete="new-password"
											className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											placeholder="Create a strong password"
										/>
										<button
											type="button"
											onClick={() => setShowPassword((prev) => !prev)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
											aria-label={showPassword ? 'Hide password' : 'Show password'}
										>
											{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
									<p className={`mt-1 text-xs ${passwordStrength.tone}`}>{passwordStrength.label}</p>
									{errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
								</div>

								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
										Confirm Password
									</label>
									<div className="relative">
										<input
											type={showConfirmPassword ? 'text' : 'password'}
											id="confirmPassword"
											name="confirmPassword"
											value={formData.confirmPassword}
											onChange={handleChange}
											autoComplete="new-password"
											className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
											placeholder="Re-enter your password"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword((prev) => !prev)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
											aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
										>
											{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
										</button>
									</div>
									{errors.confirmPassword && (
										<p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
									)}
								</div>

								<div>
									<label className="flex items-start cursor-pointer">
										<input
											type="checkbox"
											name="termsAccepted"
											checked={formData.termsAccepted}
											onChange={handleChange}
											className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
										/>
										<span className="ml-2 text-sm text-gray-700">
											I agree to the terms and conditions.
										</span>
									</label>
									{errors.termsAccepted && (
										<p className="mt-1 text-xs text-red-600">{errors.termsAccepted}</p>
									)}
								</div>

								<button
									type="submit"
									disabled={submitting}
									className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
								>
									{submitting ? (
										<span className="inline-flex items-center gap-2">
											<span className="h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
											Creating Account...
										</span>
									) : (
										'Create Account'
									)}
								</button>
							</form>

							<div className="mt-6 text-center">
								<p className="text-gray-600">
									Already have an account?{' '}
									<Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
										Sign In
									</Link>
								</p>
							</div>
						</div>

						<div className="w-full lg:w-2/5 bg-linear-to-br from-blue-600 to-purple-700 p-8 md:p-12 text-white flex flex-col justify-center">
							<div className="space-y-6">
								<div>
									<h3 className="text-2xl font-bold mb-4">Why Join LawLinkPro?</h3>
								</div>
								<ul className="space-y-4">
									<li className="flex items-start space-x-3">
										<div className="shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
											<FolderKanban className="w-4 h-4" />
										</div>
										<div>
											<p className="font-medium">Streamlined case management</p>
										</div>
									</li>
									<li className="flex items-start space-x-3">
										<div className="shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
											<MessagesSquare className="w-4 h-4" />
										</div>
										<div>
											<p className="font-medium">Secure client-lawyer communication</p>
										</div>
									</li>
									<li className="flex items-start space-x-3">
										<div className="shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
											<FileText className="w-4 h-4" />
										</div>
										<div>
											<p className="font-medium">Access legal resources and documents</p>
										</div>
									</li>
									<li className="flex items-start space-x-3">
										<div className="shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
											<BadgeCheck className="w-4 h-4" />
										</div>
										<div>
											<p className="font-medium">Connect with verified legal professionals</p>
										</div>
									</li>
								</ul>
								<div className="pt-6 border-t border-white/20">
									<p className="text-sm text-blue-100 flex items-center gap-2">
										<ShieldCheck className="w-4 h-4 shrink-0" />
										Your information is protected with bank-level encryption and security.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Signup;
