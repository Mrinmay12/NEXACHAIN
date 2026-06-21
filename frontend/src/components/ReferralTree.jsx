function TreeNode({ node, isRoot }) {
  if (!node) return null;
  return (
    <div className={isRoot ? 'tree-node tree-node-root' : 'tree-node'}>
      <div className="tree-node-label">
        {node.fullName}
        <span className="code">{node.referralCode}</span>
      </div>
      {node.children?.map((child) => (
        <TreeNode key={child._id} node={child} isRoot={false} />
      ))}
    </div>
  );
}

export default function ReferralTree({ tree, loading }) {
  return (
    <div className="section">
      <h3>Referral Tree</h3>
      {loading ? (
        <div className="loading-state">Loading referral tree...</div>
      ) : !tree ? (
        <div className="empty-state">No referral data available.</div>
      ) : (
        <TreeNode node={tree} isRoot />
      )}
    </div>
  );
}
