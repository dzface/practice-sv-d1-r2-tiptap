type ProfileGuardInput = {
	isLoggedIn: boolean;
	hasProfile: boolean;
	pathname: string;
};

export function shouldRedirectToProfileSetup({
	isLoggedIn,
	hasProfile,
	pathname
}: ProfileGuardInput) {
	return isLoggedIn && !hasProfile && pathname !== '/profile/setup';
}
