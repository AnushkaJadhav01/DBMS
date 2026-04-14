from flask import Blueprint, request, jsonify
from models.config import get_config, set_config

config_bp = Blueprint('config', __name__)

@config_bp.route('/config/<key>', methods=['GET'])
def get_config_route(key):
    val = get_config(key)
    return jsonify({"key": key, "value": val})

@config_bp.route('/config/<key>', methods=['POST', 'PUT'])
def set_config_route(key):
    data = request.json
    val = data.get('value')
    set_config(key, val)
    return jsonify({"success": True, "key": key, "value": val})
