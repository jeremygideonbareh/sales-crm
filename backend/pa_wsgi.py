import sys
from a2wsgi import ASGIMiddleware

path = "/home/jeremy2562321/sales-crm/backend"
if path not in sys.path:
    sys.path.append(path)

from app.main import app
application = ASGIMiddleware(app)
