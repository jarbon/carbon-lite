#!/usr/bin/env python3
"""Comprehensive host-agent workflow; shares durable gates and budgets with Forever."""
import carbon_forever


def operate(root, action, ident=None, payload=None):
    return carbon_forever.operate(root, action, ident, payload, expected_mode="full")


if __name__ == "__main__":
    carbon_forever.main(expected_mode="full")
