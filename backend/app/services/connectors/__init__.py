from app.services.connectors.base import ConnectorProvider, get_connector
from app.services.connectors.github import GitHubConnector
from app.services.connectors.jira import JiraConnector
from app.services.connectors.notion import NotionConnector

CONNECTOR_REGISTRY = {
    "jira": JiraConnector,
    "github": GitHubConnector,
    "notion": NotionConnector,
}

__all__ = ["ConnectorProvider", "get_connector", "CONNECTOR_REGISTRY"]
