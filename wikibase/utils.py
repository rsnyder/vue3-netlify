#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging

logging.basicConfig(format='%(asctime)s : %(filename)s : %(levelname)s : %(message)s')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

import os
import json
import yaml
import argparse

WIKIBASE = 'https://wikibase.juncture-digital.org'
SCRIPT_DIR = os.path.abspath(os.path.dirname(__file__))
CREDS = yaml.load(open(f'{SCRIPT_DIR}/creds.yaml', 'r').read(), Loader=yaml.FullLoader)

from wikibase_api import Wikibase

logger.info(CREDS)

wb = Wikibase(
  api_url=f'{WIKIBASE}/w/api.php',
  oauth_credentials=CREDS
)

def add_item(label, **kwargs):
  content = {'labels': {'en': {'language': 'en', 'value': label}}}
  if kwargs['description']:
    content['descriptions'] = {'en': {'language': 'en', 'value': kwargs['description']}}
  return wb.entity.add('item', content)

def do_request(**kwargs):
  logger.info(kwargs)
  if (kwargs['operation'] == 'add'):
    logger.info(add_item(**kwargs))

if __name__ == '__main__':
  logger.setLevel(logging.INFO)
  parser = argparse.ArgumentParser(description='Entitlement Map')
  parser.add_argument('--wikibase', help=f'Wikibase instance (default={WIKIBASE})')
  parser.add_argument('--operation', help='Operation to perform')
  parser.add_argument('--label', help='Entity label')
  parser.add_argument('--description', help='Entity label')
  args = vars(parser.parse_args())
  
  # logger.info(json.dumps(do_request(**args)))
  
  PROPS = yaml.load(open(f'{SCRIPT_DIR}/props.yaml', 'r').read(), Loader=yaml.FullLoader)
  logger.info(json.dumps(PROPS, indent=2))

