from rest_framework_simplejwt.authentication import JWTAuthentication


class CustomJWTAuthentication(JWTAuthentication):
    def get_header(self, request):
        token = request.COOKIES.get("access")
        request.META["HTTP_AUTHORIZATION"] = (
            "{header_type} {access_token}".format(
                header_type="Bearer", access_token=token
            )
        )
        refresh = request.COOKIES.get("refresh")
        request.META["HTTP_REFRESH_TOKEN"] = refresh
        is_initial_password = request.COOKIES.get("is_initial_password", True)
        request.META["HTTP_IS_INITIAL_PASSWORD"] = is_initial_password
        return super().get_header(request)
