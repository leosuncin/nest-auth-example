FROM gitpod/workspace-postgres:latest

USER root

RUN pip install httpie

USER gitpod
