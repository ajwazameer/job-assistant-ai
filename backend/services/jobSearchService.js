const axios = require('axios');

const normalizeText = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>?/gm, '').trim();
};

const searchArbeitnow = async (filters = {}) => {
  try {
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
      timeout: 8000,
    });

    const jobs = response.data?.data || [];

    return jobs.map((job) => ({
      title: normalizeText(job.title),
      company: normalizeText(job.company_name),
      location: normalizeText(job.location),
      remote: Boolean(job.remote),
      type: Array.isArray(job.job_types) && job.job_types.length > 0 ? job.job_types.join(', ') : '',
      url: job.url || '',
      source: 'arbeitnow',
      postedDate: job.created_at ? new Date(job.created_at * 1000).toISOString() : new Date().toISOString(),
      salary: null,
    }));
  } catch (error) {
    throw new Error(`Arbeitnow API error: ${error.message}`);
  }
};

const searchAdzuna = async (filters = {}) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error('Adzuna credentials (ADZUNA_APP_ID / ADZUNA_APP_KEY) not configured');
  }

  const country = process.env.ADZUNA_COUNTRY || 'us';
  const page = 1;

  const params = {
    app_id: appId,
    app_key: appKey,
    results_per_page: 25,
  };

  if (filters.query) {
    params.what = filters.query;
  }
  if (filters.location) {
    params.where = filters.location;
  }
  if (filters.type && filters.type.toLowerCase().includes('full')) {
    params.full_time = 1;
  } else if (filters.type && filters.type.toLowerCase().includes('part')) {
    params.part_time = 1;
  } else if (filters.type && filters.type.toLowerCase().includes('contract')) {
    params.contract = 1;
  }

  try {
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`, {
      params,
      timeout: 8000,
    });

    const results = response.data?.results || [];

    return results.map((job) => {
      const isRemote = Boolean(
        (job.title && job.title.toLowerCase().includes('remote')) ||
        (job.description && job.description.toLowerCase().includes('remote')) ||
        (job.location?.display_name && job.location.display_name.toLowerCase().includes('remote'))
      );

      let salary = null;
      if (job.salary_min) {
        salary = `$${Math.round(job.salary_min)}${job.salary_max ? ' - $' + Math.round(job.salary_max) : ''}`;
      }

      return {
        title: normalizeText(job.title),
        company: normalizeText(job.company?.display_name),
        location: normalizeText(job.location?.display_name),
        remote: isRemote,
        type: job.contract_time || job.contract_type || '',
        url: job.redirect_url || '',
        source: 'adzuna',
        postedDate: job.created || new Date().toISOString(),
        salary,
      };
    });
  } catch (error) {
    throw new Error(`Adzuna API error: ${error.response?.data?.display || error.message}`);
  }
};

const searchJooble = async (filters = {}) => {
  const apiKey = process.env.JOOBLE_API_KEY;

  if (!apiKey) {
    throw new Error('Jooble API key (JOOBLE_API_KEY) not configured');
  }

  const payload = {
    keywords: filters.query || '',
    location: filters.location || '',
  };

  try {
    const response = await axios.post(`https://jooble.org/api/${apiKey}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    const jobs = response.data?.jobs || [];

    return jobs.map((job) => {
      const isRemote = Boolean(
        (job.title && job.title.toLowerCase().includes('remote')) ||
        (job.location && job.location.toLowerCase().includes('remote')) ||
        (job.snippet && job.snippet.toLowerCase().includes('remote'))
      );

      return {
        title: normalizeText(job.title),
        company: normalizeText(job.company),
        location: normalizeText(job.location),
        remote: isRemote,
        type: job.type || '',
        url: job.link || '',
        source: 'jooble',
        postedDate: job.updated || new Date().toISOString(),
        salary: job.salary || null,
      };
    });
  } catch (error) {
    throw new Error(`Jooble API error: ${error.response?.data?.message || error.message}`);
  }
};

const applyFilters = (jobs, filters = {}) => {
  const { query, location, type, remote } = filters;

  return jobs.filter((job) => {
    if (query) {
      const qTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      const titleLower = (job.title || '').toLowerCase();
      const companyLower = (job.company || '').toLowerCase();
      const locationLower = (job.location || '').toLowerCase();

      const matchesQuery = qTokens.some(
        (token) => titleLower.includes(token) || companyLower.includes(token) || locationLower.includes(token)
      );

      if (!matchesQuery) return false;
    }

    if (location) {
      const locLower = (job.location || '').toLowerCase();
      if (!locLower.includes(location.toLowerCase())) {
        return false;
      }
    }

    if (remote !== undefined && remote !== '') {
      const wantRemote = remote === 'true' || remote === true;
      if (job.remote !== wantRemote) {
        return false;
      }
    }

    if (type) {
      const typeLower = (job.type || '').toLowerCase();
      const titleLower = (job.title || '').toLowerCase();
      if (!typeLower.includes(type.toLowerCase()) && !titleLower.includes(type.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
};

const searchAllJobs = async (filters = {}) => {
  const results = await Promise.allSettled([
    searchAdzuna(filters),
    searchJooble(filters),
    searchArbeitnow(filters),
  ]);

  let allJobs = [];

  results.forEach((res, index) => {
    const providerNames = ['Adzuna', 'Jooble', 'Arbeitnow'];
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allJobs.push(...res.value);
    } else {
      console.warn(`[JobSearch] ${providerNames[index]} skipped or failed:`, res.reason?.message || res.reason);
    }
  });

  return applyFilters(allJobs, filters);
};

module.exports = {
  searchAdzuna,
  searchJooble,
  searchArbeitnow,
  searchAllJobs,
};
