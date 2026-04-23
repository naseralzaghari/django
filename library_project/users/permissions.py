from functools import wraps
from graphql import GraphQLError


def login_required(func):
    """Decorator to require authentication for GraphQL resolvers"""
    @wraps(func)
    def wrapper(root, info, *args, **kwargs):
        if not info.context.user or not info.context.user.is_authenticated:
            raise GraphQLError('Authentication required. Please login.1')
        return func(root, info, *args, **kwargs)
    return wrapper


def admin_required(func):
    """Decorator to require admin role for GraphQL resolvers"""
    @wraps(func)
    def wrapper(root, info, *args, **kwargs):
        user = info.context.user
        print(f"Admin check for user: {user.username if user else 'Anonymous'}")
        if not user or not user.is_authenticated:
            raise GraphQLError('Authentication required. Please login.2')
        if not user.is_admin() and not user.is_superuser:
            raise GraphQLError('Admin privileges required to perform this action.')
        return func(root, info, *args, **kwargs)
    return wrapper


def user_passes_test(test_func, error_message="Permission denied"):
    """
    Decorator for custom permission tests on GraphQL resolvers
    
    Args:
        test_func: A function that takes user as argument and returns boolean
        error_message: Error message to display if test fails
    """
    def decorator(func):
        @wraps(func)
        def wrapper(root, info, *args, **kwargs):
            user = info.context.user
            if not user or not user.is_authenticated:
                raise GraphQLError('Authentication required. Please login.3')
            if not test_func(user):
                raise GraphQLError(error_message)
            return func(root, info, *args, **kwargs)
        return wrapper
    return decorator


def get_user_from_info(info):
    """Helper to get authenticated user from GraphQL info context"""
    user = info.context.user
    if not user or not user.is_authenticated:
        return None
    return user
