/* @flow */

import React from "react";
import Relay from "react-relay/classic";

import { Row } from "@ncigdc/uikit/Flex";
import Showing from "@ncigdc/components/Pagination/Showing";

import Pagination from "@ncigdc/components/Pagination";

import TableActions from "@ncigdc/components/TableActions";

import { Tr, Th } from "@ncigdc/uikit/Table";
import { Tooltip } from "@ncigdc/uikit/Tooltip";
import { DATA_CATEGORIES } from "@ncigdc/utils/constants";
import { tableToolTipHint } from "@ncigdc/theme/mixins";

import CaseTr from "./CaseTr";

import type { TTableProps } from "../types";

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    borderSpacing: 0
  },
  right: {
    textAlign: "right"
  }
};

export const CaseTableComponent = (props: TTableProps) => {
  const prefix = "cases";

  return (
    <div>
      <Row
        style={{
          backgroundColor: "white",
          padding: "1rem",
          justifyContent: "space-between"
        }}
      >
        <Showing
          docType="cases"
          prefix={prefix}
          params={props.relay.route.params}
          total={props.hits.total}
        />
        <TableActions
          prefix={prefix}
          total={props.hits.total}
          sortKey="cases_sort"
          endpoint={props.endpoint || "cases"}
          downloadFields={[
            "case_id",
            "project.project_id",
            "cases.primary_site",
            "demographic.gender",
            "summary.data_categories.file_count",
            "summary.data_categories.data_category"
          ]}
          sortOptions={[
            {
              id: "project.project_id",
              name: "Project"
            },
            {
              id: "primary_site",
              name: "Primary Site"
            },
            {
              id: "demographic.gender",
              name: "Gender"
            }
          ]}
          tsvSelector="#explore-case-table"
          tsvFilename="explore-case-table.tsv"
        />
      </Row>
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table} id="explore-case-table">
          <thead>
            <Tr>
              <Th rowSpan="2">Case UUID</Th>
              <Th rowSpan="2">Submitter ID</Th>
              <Th rowSpan="2">Project</Th>
              <Th rowSpan="2">Primary Site</Th>
              <Th rowSpan="2">Gender</Th>
              <Th rowSpan="2" style={styles.right}>Files</Th>
              <Th
                colSpan={Object.entries(DATA_CATEGORIES).length}
                style={styles.center}
              >
                Available Files per Data Category
              </Th>
              <Th rowSpan="2" style={styles.right}>
                <Tooltip
                  Component="# SSM Filtered by current criteria"
                  style={tableToolTipHint()}
                >
                  # Mutations
                </Tooltip>
              </Th>
              <Th rowSpan="2" style={styles.right}>
                <Tooltip
                  Component="# Genes with SSM Filtered by current criteria"
                  style={tableToolTipHint()}
                >
                  # Genes
                </Tooltip>
              </Th>
            </Tr>

            <Tr>
              {Object.values(DATA_CATEGORIES).map((category: any) => (
                <Th key={category.abbr} style={styles.right}>
                  <abbr>
                    <Tooltip
                      Component={category.full}
                      style={tableToolTipHint()}
                    >
                      {category.abbr}
                    </Tooltip>
                  </abbr>
                </Th>
              ))}
            </Tr>
          </thead>
          <tbody>
            {props.hits.edges.map((e, i) => (
              <CaseTr
                {...e}
                key={e.node.id}
                index={i}
                explore={props.explore}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        prefix={prefix}
        params={props.relay.route.params}
        total={props.hits.total}
      />
    </div>
  );
};

export const CaseTableQuery = {
  fragments: {
    hits: () => Relay.QL`
      fragment on ECaseConnection {
        total
        edges {
          node {
            id
            ${CaseTr.getFragment("node")}
          }
        }
      }
    `
  }
};

const CaseTable = Relay.createContainer(CaseTableComponent, CaseTableQuery);

export default CaseTable;