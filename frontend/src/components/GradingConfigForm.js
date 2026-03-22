import { useState, useEffect } from 'react';

const defaultWeights = {
  syntax: 10,
  function: 15,
  return: 5,
  tests: 40,
  style: 10,
  doc: 10,
};

const defaultFunctionRequirements = {
  required: false,
  name: '',
  param_count: null,
};

const GradingConfigForm = ({ initialConfig, onChange }) => {
  const [config, setConfig] = useState({
    weights: { ...defaultWeights },
    function_requirements: { ...defaultFunctionRequirements },
    require_return: true,
    require_docstring: true,
    use_pylint: true,
    feature_checks: [],
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig({
        weights: { ...defaultWeights, ...(initialConfig.weights || {}) },
        function_requirements: {
          ...defaultFunctionRequirements,
          ...(initialConfig.function_requirements || {}),
        },
        require_return: initialConfig.require_return ?? true,
        require_docstring: initialConfig.require_docstring ?? true,
        use_pylint: initialConfig.use_pylint ?? true,
        feature_checks: initialConfig.feature_checks || [],
      });
    }
  }, [initialConfig]);

  const updateWeights = (category, value) => {
    const newWeights = { ...config.weights, [category]: parseInt(value) || 0 };
    const newConfig = { ...config, weights: newWeights };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updateFunctionReq = (field, value) => {
    const newReqs = { ...config.function_requirements, [field]: value };
    const newConfig = { ...config, function_requirements: newReqs };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updateBoolean = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange(newConfig);
  };

  // Feature checks handlers
  const addFeatureCheck = () => {
    const newCheck = { name: '', weight: 0, type: 'ast', pattern: '' };
    const newChecks = [...config.feature_checks, newCheck];
    const newConfig = { ...config, feature_checks: newChecks };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updateFeatureCheck = (index, field, value) => {
    const newChecks = [...config.feature_checks];
    newChecks[index][field] = value;
    const newConfig = { ...config, feature_checks: newChecks };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const removeFeatureCheck = (index) => {
    const newChecks = config.feature_checks.filter((_, i) => i !== index);
    const newConfig = { ...config, feature_checks: newChecks };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <details className="border rounded p-3 mt-3">
      <summary className="fw-bold text-primary" style={{ cursor: 'pointer' }}>
        ⚙️ Grading Rubric Configuration (click to expand)
      </summary>

      <div className="mt-3">
        <h5>Weights (total should be 100)</h5>
        <div className="row g-3 mb-3">
          <div className="col-md-2">
            <label className="form-label">Syntax</label>
            <input
              type="number"
              className="form-control"
              value={config.weights.syntax}
              onChange={(e) => updateWeights('syntax', e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Function</label>
            <input
              type="number"
              className="form-control"
              value={config.weights.function}
              onChange={(e) => updateWeights('function', e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Return</label>
            <input
              type="number"
              className="form-control"
              value={config.weights.return}
              onChange={(e) => updateWeights('return', e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Test Cases</label>
            <input
              type="number"
              className="form-control"
              value={config.weights.tests}
              onChange={(e) => updateWeights('tests', e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Style</label>
            <input
              type="number"
              className="form-control"
              value={config.weights.style}
              onChange={(e) => updateWeights('style', e.target.value)}
              min="0"
              max="100"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Documentation</label>
            <input
              type="number"
              className="form-control"
              value={config.weights.doc}
              onChange={(e) => updateWeights('doc', e.target.value)}
              min="0"
              max="100"
            />
          </div>
        </div>

        <h5>Function Requirements</h5>
        <div className="mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="funcRequired"
              checked={config.function_requirements.required}
              onChange={(e) => updateFunctionReq('required', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="funcRequired">
              Require a function
            </label>
          </div>
        </div>

        {config.function_requirements.required && (
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Function name (optional)</label>
              <input
                type="text"
                className="form-control"
                value={config.function_requirements.name || ''}
                onChange={(e) => updateFunctionReq('name', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Parameter count (optional)</label>
              <input
                type="number"
                className="form-control"
                value={config.function_requirements.param_count ?? ''}
                onChange={(e) =>
                  updateFunctionReq('param_count', e.target.value ? parseInt(e.target.value) : null)
                }
              />
            </div>
          </div>
        )}

        <h5>Additional Checks</h5>
        <div className="mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="requireReturn"
              checked={config.require_return}
              onChange={(e) => updateBoolean('require_return', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="requireReturn">
              Require a return statement
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="requireDocstring"
              checked={config.require_docstring}
              onChange={(e) => updateBoolean('require_docstring', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="requireDocstring">
              Require a docstring
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="usePylint"
              checked={config.use_pylint}
              onChange={(e) => updateBoolean('use_pylint', e.target.checked)}
            />
            <label className="form-check-label" htmlFor="usePylint">
              Use pylint for style score
            </label>
          </div>
        </div>

        <h5>Feature Checks (optional)</h5>
        <p className="small text-muted">Add custom checks for loops, conditionals, classes, etc.</p>
        {config.feature_checks.map((check, idx) => (
          <div key={idx} className="card mb-3 p-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Contains for loop"
                  value={check.name}
                  onChange={e => updateFeatureCheck(idx, 'name', e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Weight</label>
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  value={check.weight}
                  onChange={e => updateFeatureCheck(idx, 'weight', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={check.type}
                  onChange={e => updateFeatureCheck(idx, 'type', e.target.value)}
                >
                  <option value="ast">AST Node</option>
                  <option value="keyword">Keyword</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Pattern</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={check.type === 'ast' ? 'e.g., For, While, If' : 'e.g., class, for'}
                  value={check.pattern}
                  onChange={e => updateFeatureCheck(idx, 'pattern', e.target.value)}
                />
              </div>
              <div className="col-md-1">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeFeatureCheck(idx)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline-secondary" onClick={addFeatureCheck}>
          + Add Feature Check
        </button>

        <h5 className="mt-3">Preview (JSON)</h5>
        <pre className="bg-light p-2 rounded">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </details>
  );
};

export default GradingConfigForm;