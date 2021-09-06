from setuptools import setup,find_packages
setup(
    name="email_system",
    version="0.0.1dev1",
    # packages=["."],
    package_dir={'': 'src'},
     install_requires=[
        "flask",
        "flask-cors",
        "lxml",
        "flask_cors",
        "pytz"
    ],
    entry_points={
        'console_scripts': [
            'email_app=app:cli'
        ],
    },
)